from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import WorkoutSession, SessionSetLog
from .serializers import WorkoutSessionSerializer, SessionSetLogSerializer

class WorkoutSessionViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutSessionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return WorkoutSession.objects.all()
        if user.role == 'trainer':
            client_ids = user.clients.values_list('id', flat=True)
            return WorkoutSession.objects.filter(user__in=list(client_ids) + [user.id])
        return WorkoutSession.objects.filter(user=user)

    def perform_create(self, serializer):
        date_str = self.request.data.get('date')
        date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else timezone.now().date()
        serializer.save(user=self.request.user, date=date)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        session = self.get_object()
        session.status = 'completed'
        session.completed_at = timezone.now()
        duration = request.data.get('duration')
        if duration:
            session.duration = int(duration)
        session.save()
        # Actualizar / crear entrada de calendario
        from calendar_app.models import CalendarEntry
        CalendarEntry.objects.update_or_create(
            user=request.user, date=session.date,
            defaults={'session': session, 'status': 'completed', 'routine': session.routine}
        )
        return Response(WorkoutSessionSerializer(session).data)

    @action(detail=True, methods=['post'], url_path='log-set')
    def log_set(self, request, pk=None):
        session = self.get_object()
        ser = SessionSetLogSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        log = ser.save(session=session)
        return Response(SessionSetLogSerializer(log).data, status=201)

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        today = timezone.now().date()
        session = WorkoutSession.objects.filter(user=request.user, date=today).first()
        if not session:
            return Response({'detail': 'Sin sesión hoy.'}, status=404)
        return Response(WorkoutSessionSerializer(session).data)

    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        sessions = WorkoutSession.objects.filter(user=request.user, status='completed').order_by('-date')[:30]
        return Response(WorkoutSessionSerializer(sessions, many=True).data)

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Routine, RoutineExercise, WorkoutSet
from .serializers import RoutineSerializer, RoutineListSerializer, RoutineExerciseSerializer, WorkoutSetSerializer

class IsTrainerOrAdmin(permissions.BasePermission):
    def has_permission(self, req, view):
        return req.user.is_authenticated and req.user.role in ('trainer','admin')

class RoutineViewSet(viewsets.ModelViewSet):
    search_fields = ['name', 'category', 'difficulty']
    ordering_fields = ['name', 'created_at', 'duration']

    def get_serializer_class(self):
        return RoutineSerializer if self.action == 'retrieve' else RoutineListSerializer

    def get_permissions(self):
        if self.action in ('create','update','partial_update','destroy'):
            return [IsTrainerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Routine.objects.all()
        if user.role == 'trainer':
            return Routine.objects.filter(trainer=user)
        # Clientes: sus rutinas asignadas + públicas
        return Routine.objects.filter(is_public=True) | Routine.objects.filter(assigned_to=user)

    def perform_create(self, serializer):
        serializer.save(trainer=self.request.user)

    @action(detail=True, methods=['post'], url_path='add-exercise')
    def add_exercise(self, request, pk=None):
        routine = self.get_object()
        ser = RoutineExerciseSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        re = ser.save(routine=routine)
        # Crear sets automáticamente si se envían
        sets_data = request.data.get('sets', [])
        for i, s in enumerate(sets_data, 1):
            WorkoutSet.objects.create(routine_exercise=re, set_number=i, **{k:v for k,v in s.items() if k in ('reps','duration','weight','rest')})
        return Response(RoutineExerciseSerializer(re).data, status=201)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        routine   = self.get_object()
        client_id = request.data.get('client_id')
        from users.models import User
        client = User.objects.filter(pk=client_id, role='client').first()
        if not client:
            return Response({'detail': 'Cliente no encontrado.'}, status=400)
        routine.assigned_to = client
        routine.save()
        return Response({'detail': f'Rutina asignada a {client.name}.'})

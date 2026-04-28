from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer

class IsAdminOrTrainer(permissions.BasePermission):
    def has_permission(self, req, view):
        return req.user.is_authenticated and req.user.role in ('admin','trainer')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'joined_at']

    def get_permissions(self):
        if self.action in ('list',):
            return [IsAdminOrTrainer()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get','patch'], url_path='me')
    def me(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)
        ser = UserSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    @action(detail=False, methods=['get'], url_path='my-clients')
    def my_clients(self, request):
        if request.user.role not in ('trainer','admin'):
            return Response({'detail': 'Solo entrenadores.'}, status=403)
        clients = User.objects.filter(trainer=request.user)
        return Response(UserSerializer(clients, many=True).data)

    @action(detail=True, methods=['post'], url_path='assign-trainer')
    def assign_trainer(self, request, pk=None):
        user = self.get_object()
        trainer_id = request.data.get('trainer_id')
        trainer = User.objects.filter(pk=trainer_id, role='trainer').first()
        if not trainer:
            return Response({'detail': 'Entrenador no encontrado.'}, status=400)
        user.trainer = trainer
        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        ser = ChangePasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if not request.user.check_password(ser.validated_data['old_password']):
            return Response({'old_password': 'Incorrecta.'}, status=400)
        request.user.set_password(ser.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Contraseña actualizada.'})

    @action(detail=True, methods=['post'], url_path='follow')
    def follow(self, request, pk=None):
        target = self.get_object()
        if target == request.user:
            return Response({'detail': 'No puedes seguirte a ti mismo.'}, status=400)
        if request.user.following.filter(pk=target.pk).exists():
            request.user.following.remove(target)
            following = False
        else:
            request.user.following.add(target)
            following = True
        return Response({
            'following': following,
            'followers_count': target.followers.count(),
        })

    @action(detail=True, methods=['post'], url_path='approve-trainer')
    def approve_trainer(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Solo admins.'}, status=403)
        user = self.get_object()
        user.role = 'trainer'
        user.trainer_request_pending = False
        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['post'], url_path='reject-trainer')
    def reject_trainer(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'detail': 'Solo admins.'}, status=403)
        user = self.get_object()
        user.trainer_request_pending = False
        user.save()
        return Response({'detail': 'Solicitud rechazada.'})

    @action(detail=False, methods=['get'], url_path='following')
    def get_following(self, request):
        return Response(UserSerializer(request.user.following.all(), many=True).data)

    @action(detail=False, methods=['get'], url_path='followers')
    def get_followers(self, request):
        return Response(UserSerializer(request.user.followers.all(), many=True).data)

    @action(detail=False, methods=['post'], url_path='request-trainer')
    def request_trainer(self, request):
        """Cliente solicita convertirse en entrenador."""
        if request.user.role != 'client':
            return Response({'detail': 'Solo clientes pueden solicitar ser entrenador.'}, status=400)
        request.user.trainer_request_pending = True
        request.user.save()
        return Response({'detail': 'Solicitud enviada.'})

    @action(detail=False, methods=['get'], url_path='pending-trainers')
    def pending_trainers(self, request):
        """Admin: lista usuarios con solicitud de entrenador pendiente."""
        if request.user.role != 'admin':
            return Response({'detail': 'Solo admins.'}, status=403)
        users = User.objects.filter(trainer_request_pending=True)
        return Response(UserSerializer(users, many=True).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Estadísticas del usuario autenticado: sesiones, rutinas, seguidores."""
        from workouts.models import WorkoutSession
        from routines.models import Routine
        user = request.user
        sessions_count = WorkoutSession.objects.filter(user=user, status='completed').count()
        # Routines: for trainers/admins count created; for clients count assigned
        if user.role in ('trainer', 'admin'):
            routines_count = Routine.objects.filter(trainer=user).count()
        else:
            routines_count = Routine.objects.filter(assigned_to=user).count()
        followers_count = user.followers.count()
        following_count = user.following.count()
        return Response({
            'sessions': sessions_count,
            'routines': routines_count,
            'followers': followers_count,
            'following': following_count,
        })

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Routine, RoutineExercise, WorkoutSet
from .serializers import RoutineSerializer, RoutineListSerializer, RoutineExerciseSerializer, WorkoutSetSerializer


class IsOwnerOrAdminOrTrainer(permissions.BasePermission):
    """
    - Admin: puede hacer todo.
    - Trainer: puede editar/borrar sus propias rutinas.
    - Client: puede editar/borrar sus propias rutinas.
    Solo el creador (trainer field) o un admin puede modificar/borrar.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'admin' or obj.trainer == request.user


class RoutineViewSet(viewsets.ModelViewSet):
    search_fields  = ['name', 'category', 'difficulty']
    ordering_fields = ['name', 'created_at', 'duration']

    def get_serializer_class(self):
        return RoutineSerializer if self.action == 'retrieve' else RoutineListSerializer

    def get_permissions(self):
        # Cualquier usuario autenticado puede crear rutinas
        # Solo el dueño o admin puede editar/borrar (validado en has_object_permission)
        return [permissions.IsAuthenticated(), IsOwnerOrAdminOrTrainer()]

    def get_queryset(self):
        user = self.request.user
        trainer_filter = self.request.query_params.get('trainer')
        if trainer_filter:
            # Public endpoint: return routines by a specific trainer
            return Routine.objects.filter(trainer__pk=trainer_filter).distinct()
        if user.role == 'admin':
            return Routine.objects.all()
        if user.role == 'trainer':
            # Entrenador ve las suyas y las públicas
            return Routine.objects.filter(trainer=user) | Routine.objects.filter(is_public=True)
        # Cliente: sus propias rutinas + las que le asignaron + las públicas
        return (
            Routine.objects.filter(trainer=user) |
            Routine.objects.filter(assigned_to=user) |
            Routine.objects.filter(is_public=True)
        ).distinct()

    def perform_create(self, serializer):
        # El creador siempre es el usuario que hace la petición
        serializer.save(trainer=self.request.user)

    @action(detail=True, methods=['post'], url_path='add-exercise')
    def add_exercise(self, request, pk=None):
        routine = self.get_object()
        # Solo el dueño o admin puede agregar ejercicios
        if routine.trainer != request.user and request.user.role != 'admin':
            return Response({'detail': 'No tienes permiso para editar esta rutina.'}, status=403)
        ser = RoutineExerciseSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        re = ser.save(routine=routine)
        sets_data = request.data.get('sets', [])
        for i, s in enumerate(sets_data, 1):
            WorkoutSet.objects.create(
                routine_exercise=re, set_number=i,
                **{k: v for k, v in s.items() if k in ('reps', 'duration', 'weight', 'rest')}
            )
        return Response(RoutineExerciseSerializer(re).data, status=201)

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        routine = self.get_object()
        # Solo trainers y admins pueden asignar rutinas a otros usuarios
        if request.user.role not in ('trainer', 'admin'):
            return Response({'detail': 'Solo entrenadores pueden asignar rutinas.'}, status=403)
        client_id = request.data.get('client_id')
        from users.models import User
        client = User.objects.filter(pk=client_id).first()
        if not client:
            return Response({'detail': 'Usuario no encontrado.'}, status=400)
        routine.assigned_to = client
        routine.save()
        return Response({'detail': f'Rutina asignada a {client.name}.'})

    @action(detail=False, methods=['get'], url_path='mis-rutinas')
    def mis_rutinas(self, request):
        """Devuelve solo las rutinas creadas por el usuario actual."""
        qs = Routine.objects.filter(trainer=request.user)
        ser = RoutineListSerializer(qs, many=True)
        return Response(ser.data)

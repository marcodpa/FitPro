from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Exercise
from .serializers import ExerciseSerializer

class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.filter(is_public=True)
    serializer_class = ExerciseSerializer
    search_fields = ['name', 'muscle', 'category']
    ordering_fields = ['name', 'difficulty', 'category']
    filterset_fields = ['category', 'difficulty', 'muscle']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        qs = Exercise.objects.all()
        category   = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        muscle     = self.request.query_params.get('muscle')
        if category:   qs = qs.filter(category=category)
        if difficulty: qs = qs.filter(difficulty=difficulty)
        if muscle:     qs = qs.filter(muscle__icontains=muscle)
        return qs

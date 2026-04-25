from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    search_fields = ['text', 'author__name']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Post.objects.all().prefetch_related('likes', 'comments', 'comments__author')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'No autorizado'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user and not request.user.is_staff:
            return Response({'detail': 'No autorizado'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='like')
    def like(self, request, pk=None):
        post = self.get_object()
        if post.likes.filter(pk=request.user.pk).exists():
            post.likes.remove(request.user)
        else:
            post.likes.add(request.user)
        return Response(PostSerializer(post, context={'request': request}).data)

    @action(detail=True, methods=['post'], url_path='comment')
    def comment(self, request, pk=None):
        post = self.get_object()
        ser = CommentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        c = ser.save(post=post, author=request.user)
        return Response(CommentSerializer(c).data, status=201)

    @action(detail=True, methods=['post'], url_path='report')
    def report(self, request, pk=None):
        post = self.get_object()
        reason = request.data.get('reason', 'Sin motivo')
        # In a real app, save to a Report model. Here we just acknowledge.
        return Response({'detail': f'Reporte recibido: {reason}'}, status=200)

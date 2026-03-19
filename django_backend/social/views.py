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
        return Post.objects.all().prefetch_related('likes','comments','comments__author')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=True, methods=['post'], url_path='like')
    def like(self, request, pk=None):
        post = self.get_object()
        if post.likes.filter(pk=request.user.pk).exists():
            post.likes.remove(request.user)
            liked = False
        else:
            post.likes.add(request.user)
            liked = True
        return Response({'liked': liked, 'likes_count': post.likes_count})

    @action(detail=True, methods=['post'], url_path='comment')
    def comment(self, request, pk=None):
        post = self.get_object()
        ser  = CommentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        c = ser.save(post=post, author=request.user)
        return Response(CommentSerializer(c).data, status=201)

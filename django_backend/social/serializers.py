from rest_framework import serializers
from users.serializers import UserMiniSerializer
from .models import Post, Comment

class CommentSerializer(serializers.ModelSerializer):
    author = UserMiniSerializer(read_only=True)
    class Meta:
        model  = Comment
        fields = ['id','post','author','text','created_at']
        read_only_fields = ['author','created_at']

class PostSerializer(serializers.ModelSerializer):
    author         = UserMiniSerializer(read_only=True)
    comments       = CommentSerializer(many=True, read_only=True)
    likes_count    = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked       = serializers.SerializerMethodField()

    class Meta:
        model  = Post
        fields = ['id','author','text','image_url','routine','likes_count',
                  'comments_count','comments','is_liked','created_at','updated_at']
        read_only_fields = ['author','created_at','updated_at']

    def get_is_liked(self, obj):
        req = self.context.get('request')
        return req and obj.likes.filter(pk=req.user.pk).exists()

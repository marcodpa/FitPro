from rest_framework import serializers
from users.serializers import UserMiniSerializer
from .models import Conversation, ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    class Meta:
        model  = ChatMessage
        fields = ['id','conversation','sender','text','msg_type','routine','sent_at','read_at']
        read_only_fields = ['sender','sent_at']

class ConversationSerializer(serializers.ModelSerializer):
    participants  = UserMiniSerializer(many=True, read_only=True)
    last_message  = ChatMessageSerializer(read_only=True)
    unread_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Conversation
        fields = ['id','participants','last_message','unread_count','created_at','updated_at']

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(read_at__isnull=True).exclude(sender=user).count()

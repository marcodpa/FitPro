from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Conversation, ChatMessage
from .serializers import ConversationSerializer, ChatMessageSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return self.request.user.conversations.all()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def perform_create(self, serializer):
        conv = serializer.save()
        conv.participants.add(self.request.user)

    @action(detail=True, methods=['get','post'], url_path='messages')
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if request.method == 'GET':
            msgs = conversation.messages.all()
            # Marcar como leídos
            msgs.exclude(sender=request.user).filter(read_at__isnull=True).update(read_at=timezone.now())
            return Response(ChatMessageSerializer(msgs, many=True).data)
        ser = ChatMessageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        msg = ser.save(conversation=conversation, sender=request.user)
        conversation.save()  # actualiza updated_at
        return Response(ChatMessageSerializer(msg).data, status=201)

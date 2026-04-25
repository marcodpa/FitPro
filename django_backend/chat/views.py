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
        participants = self.request.data.get('participants', [])
        conv = serializer.save()
        conv.participants.add(self.request.user)
        for pid in participants:
            try:
                from users.models import User
                u = User.objects.get(pk=pid)
                conv.participants.add(u)
            except Exception:
                pass

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if request.method == 'GET':
            msgs = conversation.messages.filter(is_deleted=False)
            msgs.exclude(sender=request.user).filter(read_at__isnull=True).update(read_at=timezone.now())
            return Response(ChatMessageSerializer(msgs, many=True).data)
        ser = ChatMessageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        msg = ser.save(conversation=conversation, sender=request.user)
        conversation.save()
        return Response(ChatMessageSerializer(msg).data, status=201)

    @action(detail=True, methods=['patch'], url_path=r'messages/(?P<msg_id>[^/.]+)/edit')
    def edit_message(self, request, pk=None, msg_id=None):
        conversation = self.get_object()
        try:
            msg = conversation.messages.get(pk=msg_id, sender=request.user, is_deleted=False)
        except ChatMessage.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        msg.text = request.data.get('text', msg.text)
        msg.is_edited = True
        msg.save()
        return Response(ChatMessageSerializer(msg).data)

    @action(detail=True, methods=['delete'], url_path=r'messages/(?P<msg_id>[^/.]+)/delete')
    def delete_message(self, request, pk=None, msg_id=None):
        conversation = self.get_object()
        try:
            msg = conversation.messages.get(pk=msg_id, sender=request.user)
        except ChatMessage.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        msg.is_deleted = True
        msg.text = 'Mensaje eliminado'
        msg.save()
        return Response(status=204)

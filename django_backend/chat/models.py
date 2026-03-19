from django.db import models

class Conversation(models.Model):
    participants = models.ManyToManyField('users.User', related_name='conversations')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'chat'
        ordering  = ['-updated_at']
        verbose_name = 'Conversación'
        verbose_name_plural = 'Conversaciones'

    def __str__(self):
        names = ', '.join(p.name for p in self.participants.all()[:2])
        return f'Conversación: {names}'

    @property
    def last_message(self):
        return self.messages.order_by('-sent_at').first()


class ChatMessage(models.Model):
    MSG_TYPES = [('text','Texto'),('routine','Rutina compartida'),('image','Imagen')]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender       = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='sent_messages')
    text         = models.TextField()
    msg_type     = models.CharField(max_length=10, choices=MSG_TYPES, default='text')
    routine      = models.ForeignKey('routines.Routine', null=True, blank=True, on_delete=models.SET_NULL)
    sent_at      = models.DateTimeField(auto_now_add=True)
    read_at      = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'chat'
        ordering  = ['sent_at']
        verbose_name = 'Mensaje'
        verbose_name_plural = 'Mensajes'

    def __str__(self):
        return f'{self.sender.name}: {self.text[:40]}'

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CalendarEntry
from .serializers import CalendarEntrySerializer

class CalendarViewSet(viewsets.ModelViewSet):
    serializer_class = CalendarEntrySerializer

    def get_queryset(self):
        user = self.request.user
        qs   = CalendarEntry.objects.filter(user=user)
        year  = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        if year:  qs = qs.filter(date__year=year)
        if month: qs = qs.filter(date__month=month)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

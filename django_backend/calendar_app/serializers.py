from rest_framework import serializers
from .models import CalendarEntry

class CalendarEntrySerializer(serializers.ModelSerializer):
    routine_name = serializers.CharField(source='routine.name', read_only=True)
    has_workout  = serializers.SerializerMethodField()

    class Meta:
        model  = CalendarEntry
        fields = ['id','user','date','routine','routine_name','session','status','notes','has_workout','created_at']
        read_only_fields = ['user','created_at']

    def get_has_workout(self, obj):
        return obj.routine is not None or obj.session is not None

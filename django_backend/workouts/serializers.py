from rest_framework import serializers
from .models import WorkoutSession, SessionSetLog

class SessionSetLogSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    class Meta:
        model  = SessionSetLog
        fields = ['id','exercise','exercise_name','set_number','reps_done','duration_done','weight_used','completed','logged_at']

class WorkoutSessionSerializer(serializers.ModelSerializer):
    routine_name = serializers.CharField(source='routine.name', read_only=True)
    set_logs     = SessionSetLogSerializer(many=True, read_only=True)
    duration_fmt = serializers.SerializerMethodField()

    class Meta:
        model  = WorkoutSession
        fields = ['id','user','routine','routine_name','date','started_at','completed_at',
                  'duration','duration_fmt','status','notes','calories','set_logs']
        read_only_fields = ['user','started_at']

    def get_duration_fmt(self, obj):
        m, s = divmod(obj.duration, 60)
        return f'{m:02d}:{s:02d}'

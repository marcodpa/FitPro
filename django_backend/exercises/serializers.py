from rest_framework import serializers
from .models import Exercise

class ExerciseSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    class Meta:
        model  = Exercise
        fields = '__all__'
        read_only_fields = ['created_at','updated_at','created_by']

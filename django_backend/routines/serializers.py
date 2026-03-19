from rest_framework import serializers
from exercises.serializers import ExerciseSerializer
from .models import Routine, RoutineExercise, WorkoutSet

class WorkoutSetSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkoutSet
        fields = ['id','set_number','reps','duration','weight','rest']

class RoutineExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__('exercises.models', fromlist=['Exercise']).Exercise.objects.all(),
        source='exercise', write_only=True
    )
    sets = WorkoutSetSerializer(many=True, read_only=True)

    class Meta:
        model  = RoutineExercise
        fields = ['id','exercise','exercise_id','order','notes','sets']

class RoutineSerializer(serializers.ModelSerializer):
    exercises    = RoutineExerciseSerializer(many=True, read_only=True)
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True)
    exercises_count  = serializers.SerializerMethodField()

    class Meta:
        model  = Routine
        fields = ['id','name','description','trainer','trainer_name','assigned_to',
                  'assigned_to_name','duration','difficulty','category','image_url',
                  'is_public','is_active','exercises','exercises_count','created_at','updated_at']
        read_only_fields = ['trainer','created_at','updated_at']

    def get_exercises_count(self, obj):
        return obj.exercises.count()

class RoutineListSerializer(serializers.ModelSerializer):
    trainer_name    = serializers.CharField(source='trainer.name', read_only=True)
    exercises_count = serializers.SerializerMethodField()

    class Meta:
        model  = Routine
        fields = ['id','name','description','trainer_name','duration','difficulty',
                  'category','image_url','is_public','exercises_count','created_at']

    def get_exercises_count(self, obj):
        return obj.exercises.count()

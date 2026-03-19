from django.contrib import admin
from .models import Routine, RoutineExercise, WorkoutSet

class WorkoutSetInline(admin.TabularInline):
    model = WorkoutSet
    extra = 1

class RoutineExerciseInline(admin.TabularInline):
    model = RoutineExercise
    extra = 1

@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display  = ['name','trainer','difficulty','category','duration','is_active']
    list_filter   = ['difficulty','category','is_active']
    search_fields = ['name','trainer__name']
    inlines       = [RoutineExerciseInline]

from django.contrib import admin
from .models import Exercise

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display  = ['name','category','muscle','difficulty','is_public']
    list_filter   = ['category','difficulty','is_public']
    search_fields = ['name','muscle']

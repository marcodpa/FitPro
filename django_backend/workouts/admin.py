from django.contrib import admin
from .models import WorkoutSession, SessionSetLog

class SetLogInline(admin.TabularInline):
    model = SessionSetLog
    extra = 0

@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ['user','routine','date','status','duration']
    list_filter  = ['status','date']
    inlines      = [SetLogInline]

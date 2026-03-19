from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ['email','name','role','is_active','joined_at']
    list_filter   = ['role','is_active']
    search_fields = ['name','email']
    ordering      = ['-joined_at']
    fieldsets = (
        (None, {'fields': ('email','password')}),
        ('Info personal', {'fields': ('name','role','avatar','bio','weight','height','goal','trainer')}),
        ('Permisos', {'fields': ('is_active','is_staff','is_superuser','groups','user_permissions')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('email','name','password1','password2','role')}),
    )

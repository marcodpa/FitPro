from django.contrib import admin
from .models import Plan, Payment

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name','price','currency','period','is_active']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user','plan','amount','status','date','due_date']
    list_filter  = ['status']
    search_fields = ['user__name','user__email']

from rest_framework import serializers
from users.serializers import UserMiniSerializer
from .models import Plan, Payment

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Plan
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    user      = UserMiniSerializer(read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.name', read_only=True)

    class Meta:
        model  = Payment
        fields = ['id','user','plan','plan_name','amount','currency','status','receipt',
                  'date','due_date','validated_by','validated_by_name','validated_at','notes']
        read_only_fields = ['user','date','validated_by','validated_at']

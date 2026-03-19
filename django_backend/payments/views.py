from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Plan, Payment
from .serializers import PlanSerializer, PaymentSerializer

class IsAdmin(permissions.BasePermission):
    def has_permission(self, req, view):
        return req.user.is_authenticated and req.user.role == 'admin'

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.action in ('list','retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            qs = Payment.objects.all()
            st = self.request.query_params.get('status')
            if st: qs = qs.filter(status=st)
            return qs
        return Payment.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='validate', permission_classes=[IsAdmin])
    def validate_payment(self, request, pk=None):
        payment = self.get_object()
        if payment.status != 'pending':
            return Response({'detail': 'Solo se pueden validar pagos pendientes.'}, status=400)
        payment.status       = 'paid'
        payment.validated_by = request.user
        payment.validated_at = timezone.now()
        payment.save()
        return Response(PaymentSerializer(payment).data)

    @action(detail=True, methods=['post'], url_path='reject', permission_classes=[IsAdmin])
    def reject_payment(self, request, pk=None):
        payment = self.get_object()
        payment.status = 'rejected'
        payment.notes  = request.data.get('notes', '')
        payment.save()
        return Response(PaymentSerializer(payment).data)

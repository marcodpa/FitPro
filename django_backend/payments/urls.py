from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanViewSet, PaymentViewSet
router = DefaultRouter()
router.register('plans',    PlanViewSet,    basename='plan')
router.register('payments', PaymentViewSet, basename='payment')
urlpatterns = [path('', include(router.urls))]

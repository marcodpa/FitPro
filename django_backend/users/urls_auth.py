from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views_auth import RegisterView, LoginView, LogoutView, ForgotPasswordView, ResetPasswordView, ChangeTrainerView, BlockUserView

urlpatterns = [
    path('register/',           RegisterView.as_view(),       name='register'),
    path('login/',              LoginView.as_view(),          name='login'),
    path('refresh/',            TokenRefreshView.as_view(),   name='token_refresh'),
    path('logout/',             LogoutView.as_view(),         name='logout'),
    path('forgot-password/',    ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/',     ResetPasswordView.as_view(),  name='reset_password'),
    path('change-trainer/',     ChangeTrainerView.as_view(),  name='change_trainer'),
    path('block-user/<int:pk>/', BlockUserView.as_view(),     name='block_user'),
]

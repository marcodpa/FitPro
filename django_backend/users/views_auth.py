from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user':    UserSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'detail': 'Credenciales incorrectas.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'detail': 'Cuenta desactivada.'}, status=status.HTTP_403_FORBIDDEN)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user':    UserSerializer(user).data,
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
        })

class LogoutView(APIView):
    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass
        return Response({'detail': 'Sesión cerrada.'})

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        # In production send a real email. Here we acknowledge always (security: don't reveal if user exists)
        try:
            User.objects.get(email=email)
        except User.DoesNotExist:
            pass
        return Response({'detail': 'Si el email existe, recibirás un enlace de recuperación.'})

class ChangeTrainerView(APIView):
    def post(self, request):
        action_type = request.data.get('action', 'change')  # 'change' or 'cancel'
        if action_type == 'cancel':
            request.user.trainer = None
            request.user.save()
            return Response({'detail': 'Suscripción con entrenador cancelada.'})
        new_trainer_id = request.data.get('trainer_id')
        if new_trainer_id:
            try:
                trainer = User.objects.get(pk=new_trainer_id, role='trainer')
                request.user.trainer = trainer
                request.user.save()
                return Response({'detail': 'Entrenador actualizado.'})
            except User.DoesNotExist:
                return Response({'detail': 'Entrenador no encontrado.'}, status=404)
        return Response({'detail': 'Solicitud de cambio de entrenador recibida. Un administrador la procesará.'})

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # In production: validate token/uid from email link
        # Here we accept new_password + uid for simplicity
        uid          = request.data.get('uid')
        new_password = request.data.get('new_password', '')
        new_password2 = request.data.get('new_password2', '')

        if not uid or not new_password:
            return Response({'detail': 'Datos incompletos.'}, status=400)
        if new_password != new_password2:
            return Response({'detail': 'Las contraseñas no coinciden.'}, status=400)
        if len(new_password) < 6:
            return Response({'detail': 'Contraseña muy corta.'}, status=400)

        try:
            user = User.objects.get(pk=uid)
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Contraseña actualizada exitosamente.'})
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Enlace inválido o expirado.'}, status=400)

class BlockUserView(APIView):
    def post(self, request, pk=None):
        if not request.user.role == 'admin':
            return Response({'detail': 'Solo admins.'}, status=403)
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            state = 'activado' if user.is_active else 'bloqueado'
            return Response({'detail': f'Usuario {state}.', 'is_active': user.is_active})
        except User.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=404)

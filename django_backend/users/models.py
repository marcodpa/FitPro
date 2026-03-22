from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('El email es requerido')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra):
        extra.setdefault('role', 'admin')
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    ROLES = [
        ('client',  'Cliente'),
        ('trainer', 'Entrenador'),
        ('admin',   'Administrador'),
    ]

    email     = models.EmailField(unique=True)
    name      = models.CharField(max_length=150)
    role      = models.CharField(max_length=10, choices=ROLES, default='client')
    avatar    = models.URLField(max_length=500, blank=True, default='')
    bio       = models.TextField(blank=True)
    weight    = models.FloatField(null=True, blank=True, help_text='kg')
    height    = models.FloatField(null=True, blank=True, help_text='cm')
    goal      = models.CharField(max_length=200, blank=True)
    trainer   = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='clients', limit_choices_to={'role': 'trainer'}
    )
    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        app_label = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-joined_at']

    def __str__(self):
        return f'{self.name} <{self.email}> [{self.role}]'

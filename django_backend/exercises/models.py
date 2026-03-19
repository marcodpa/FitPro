from django.db import models

class Exercise(models.Model):
    CATEGORIES   = [('strength','Fuerza'),('cardio','Cardio'),('core','Core'),('flexibility','Flexibilidad'),('balance','Equilibrio')]
    DIFFICULTIES = [('beginner','Principiante'),('intermediate','Intermedio'),('advanced','Avanzado')]

    name         = models.CharField(max_length=200)
    category     = models.CharField(max_length=20, choices=CATEGORIES)
    muscle       = models.CharField(max_length=100)
    difficulty   = models.CharField(max_length=20, choices=DIFFICULTIES, default='beginner')
    description  = models.TextField()
    image_url    = models.URLField(blank=True)
    video_url    = models.URLField(blank=True)
    instructions = models.JSONField(default=list, help_text='Lista de pasos')
    created_by   = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='created_exercises')
    is_public    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'exercises'
        ordering = ['name']
        verbose_name = 'Ejercicio'
        verbose_name_plural = 'Ejercicios'

    def __str__(self):
        return f'{self.name} ({self.get_category_display()})'

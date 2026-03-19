from django.db import models

class Routine(models.Model):
    DIFFICULTIES = [('beginner','Principiante'),('intermediate','Intermedio'),('advanced','Avanzado')]
    CATEGORIES   = [('strength','Fuerza'),('cardio','Cardio'),('hiit','HIIT'),('yoga','Yoga'),('mobility','Movilidad'),('custom','Personalizada')]

    name        = models.CharField(max_length=200)
    description = models.TextField()
    trainer     = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_routines')
    assigned_to = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_routines')
    duration    = models.PositiveIntegerField(help_text='Minutos estimados')
    difficulty  = models.CharField(max_length=20, choices=DIFFICULTIES, default='beginner')
    category    = models.CharField(max_length=20, choices=CATEGORIES, default='strength')
    image_url   = models.URLField(blank=True)
    is_public   = models.BooleanField(default=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'routines'
        ordering  = ['-created_at']
        verbose_name = 'Rutina'
        verbose_name_plural = 'Rutinas'

    def __str__(self):
        return f'{self.name} — {self.trainer.name}'


class RoutineExercise(models.Model):
    """Ejercicio dentro de una rutina con su configuración de series."""
    routine    = models.ForeignKey(Routine, on_delete=models.CASCADE, related_name='exercises')
    exercise   = models.ForeignKey('exercises.Exercise', on_delete=models.CASCADE)
    order      = models.PositiveSmallIntegerField(default=0)
    notes      = models.CharField(max_length=300, blank=True)

    class Meta:
        app_label = 'routines'
        ordering  = ['order']
        unique_together = [('routine', 'exercise', 'order')]

    def __str__(self):
        return f'{self.routine.name} → {self.exercise.name} (orden {self.order})'


class WorkoutSet(models.Model):
    """Serie individual de un ejercicio en una rutina."""
    routine_exercise = models.ForeignKey(RoutineExercise, on_delete=models.CASCADE, related_name='sets')
    set_number       = models.PositiveSmallIntegerField()
    reps             = models.PositiveSmallIntegerField(null=True, blank=True)
    duration         = models.PositiveSmallIntegerField(null=True, blank=True, help_text='segundos')
    weight           = models.FloatField(null=True, blank=True, help_text='kg')
    rest             = models.PositiveSmallIntegerField(default=60, help_text='segundos de descanso')

    class Meta:
        app_label = 'routines'
        ordering  = ['set_number']

    def __str__(self):
        return f'Serie {self.set_number} — {self.routine_exercise}'

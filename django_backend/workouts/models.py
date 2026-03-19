from django.db import models

class WorkoutSession(models.Model):
    STATUS = [('in_progress','En progreso'),('completed','Completado'),('abandoned','Abandonado')]

    user       = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='workout_sessions')
    routine    = models.ForeignKey('routines.Routine', on_delete=models.SET_NULL, null=True, related_name='sessions')
    date       = models.DateField()
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    duration   = models.PositiveIntegerField(default=0, help_text='segundos totales')
    status     = models.CharField(max_length=15, choices=STATUS, default='in_progress')
    notes      = models.TextField(blank=True)
    calories   = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        app_label = 'workouts'
        ordering  = ['-date']
        verbose_name = 'Sesión de entrenamiento'
        verbose_name_plural = 'Sesiones de entrenamiento'

    def __str__(self):
        return f'{self.user.name} — {self.routine.name if self.routine else "Sin rutina"} ({self.date})'


class SessionSetLog(models.Model):
    """Registro de cada serie completada durante una sesión."""
    session      = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='set_logs')
    workout_set  = models.ForeignKey('routines.WorkoutSet', on_delete=models.SET_NULL, null=True)
    exercise     = models.ForeignKey('exercises.Exercise', on_delete=models.SET_NULL, null=True)
    set_number   = models.PositiveSmallIntegerField()
    reps_done    = models.PositiveSmallIntegerField(null=True, blank=True)
    duration_done = models.PositiveSmallIntegerField(null=True, blank=True)
    weight_used  = models.FloatField(null=True, blank=True)
    completed    = models.BooleanField(default=False)
    logged_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'workouts'
        ordering  = ['set_number']

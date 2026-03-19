from django.db import models

class CalendarEntry(models.Model):
    STATUS = [('planned','Planificado'),('completed','Completado'),('skipped','Saltado')]

    user         = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='calendar_entries')
    date         = models.DateField()
    routine      = models.ForeignKey('routines.Routine', null=True, blank=True, on_delete=models.SET_NULL)
    session      = models.OneToOneField('workouts.WorkoutSession', null=True, blank=True, on_delete=models.SET_NULL)
    status       = models.CharField(max_length=10, choices=STATUS, default='planned')
    notes        = models.CharField(max_length=300, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label   = 'calendar_app'
        ordering    = ['-date']
        unique_together = [('user', 'date')]
        verbose_name = 'Entrada de Calendario'
        verbose_name_plural = 'Calendario'

    def __str__(self):
        return f'{self.user.name} — {self.date} [{self.status}]'

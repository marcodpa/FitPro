from django.db import models

class Plan(models.Model):
    PERIODS = [('monthly','Mensual'),('quarterly','Trimestral'),('yearly','Anual')]

    name       = models.CharField(max_length=100)
    price      = models.DecimalField(max_digits=10, decimal_places=2)
    currency   = models.CharField(max_length=3, default='COP')
    period     = models.CharField(max_length=15, choices=PERIODS, default='monthly')
    features   = models.JSONField(default=list)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'payments'
        ordering  = ['price']
        verbose_name = 'Plan'
        verbose_name_plural = 'Planes'

    def __str__(self):
        return f'{self.name} — {self.currency} {self.price}/{self.period}'


class Payment(models.Model):
    STATUS = [('pending','Pendiente'),('paid','Pagado'),('rejected','Rechazado'),('expired','Vencido')]

    user       = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='payments')
    plan       = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    amount     = models.DecimalField(max_digits=10, decimal_places=2)
    currency   = models.CharField(max_length=3, default='COP')
    status     = models.CharField(max_length=10, choices=STATUS, default='pending')
    receipt    = models.ImageField(upload_to='receipts/', null=True, blank=True)
    date       = models.DateField(auto_now_add=True)
    due_date   = models.DateField()
    validated_by = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='validated_payments')
    validated_at = models.DateTimeField(null=True, blank=True)
    notes      = models.TextField(blank=True)

    class Meta:
        app_label = 'payments'
        ordering  = ['-date']
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'

    def __str__(self):
        return f'{self.user.name} — {self.plan} [{self.status}]'

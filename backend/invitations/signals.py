# signals.py (crear nuevo archivo)
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import Confirmacion

@receiver(post_save, sender=Confirmacion)
def enviar_notificacion_confirmacion(sender, instance, created, **kwargs):
    if created:
        evento = instance.invitacion.evento
        usuario = evento.usuario
        
        # Enviar email de notificación
        subject = f'Nueva confirmación para {evento.titulo}'
        message = (f'{instance.nombre_invitado} ha confirmado asistencia.\n'
                   f'Acompañantes: {instance.acompanantes}\n'
                   f'Comentarios: {instance.comentarios or "Ninguno"}')
        
        send_mail(
            subject,
            message,
            'notificaciones@eventos.com',
            [usuario.email],
            fail_silently=False,
        )
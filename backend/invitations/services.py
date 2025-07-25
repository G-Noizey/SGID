# backend/invitations/services.py

import os
from django.conf import settings
from django.core.mail import send_mail
from twilio.rest import Client

def enviar_correo(destinatario, asunto, mensaje):
    """Envía un correo electrónico"""
    send_mail(
        asunto,
        mensaje,
        settings.EMAIL_HOST_USER,
        [destinatario],
        fail_silently=False,
    )

def enviar_whatsapp(numero, mensaje):
    """Envía un mensaje por WhatsApp usando Twilio"""
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    message = client.messages.create(
        body=mensaje,
        from_=settings.TWILIO_WHATSAPP_NUMBER,
        to=f'whatsapp:{numero}'
    )
    return message.sid
# backend/invitations/services.py

import os
from django.conf import settings
from django.core.mail import send_mail
from twilio.rest import Client
from django.core.mail import EmailMultiAlternatives
from django.core.mail import EmailMessage

def enviar_correo(destinatario, asunto, mensaje_html):
    """Envía un correo electrónico con formato HTML"""
    email = EmailMessage(
        subject=asunto,
        body=mensaje_html,
        from_email=settings.EMAIL_HOST_USER,
        to=[destinatario],
    )
    email.content_subtype = "html"  # Especificar que el cuerpo es HTML
    email.send()


def enviar_whatsapp(numero, mensaje):
    print(f"[INFO] Enviando WhatsApp a {numero}")
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=mensaje,
            from_=settings.TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{numero}"
        )
        print(f"[SUCCESS] WhatsApp enviado. SID: {message.sid}")
    except Exception as e:
        print(f"[ERROR] Error al enviar WhatsApp: {e}")
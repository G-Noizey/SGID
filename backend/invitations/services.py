import logging
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from twilio.rest import Client

logger = logging.getLogger(__name__)

def enviar_correo(destinatario, asunto, mensaje_html):
    """
    Envía un correo electrónico sin adjuntos
    """
    try:
        email = EmailMultiAlternatives(
            subject=asunto,
            body=strip_tags(mensaje_html),
            from_email=settings.EMAIL_HOST_USER,
            to=[destinatario]
        )
        
        email.attach_alternative(mensaje_html, "text/html")
        email.send()
        logger.info(f"Correo enviado exitosamente a {destinatario}")
        return True
    except Exception as e:
        logger.error(f"Error enviando correo a {destinatario}: {str(e)}")
        return False

def enviar_whatsapp(numero, mensaje):
    try:
        logger.info(f"Intentando enviar WhatsApp a {numero}")
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=mensaje,
            from_=settings.TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{numero}"
        )
        logger.info(f"WhatsApp enviado exitosamente. SID: {message.sid}")
        return True
    except Exception as e:
        logger.error(f"Error enviando WhatsApp: {str(e)}")
        return False
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid

class Plantilla(models.Model):
    nombre = models.CharField(max_length=50)
    ruta_archivo = models.CharField(max_length=255, blank=True, null=True)
    config_diseno = models.JSONField()
    imagen_preview = models.ImageField(upload_to='plantillas/previews/', null=True, blank=True)
    es_publica = models.BooleanField(default=True)
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nombre

class Evento(models.Model):
    TIPOS_EVENTO = (
        ('boda', 'Boda'),
        ('cumpleaños', 'Cumpleaños'),
        ('baby_shower', 'Baby Shower'),
        ('graduacion', 'Graduación'),
        ('otro', 'Otro'),
    )
    
    titulo = models.CharField(max_length=100)
    tipo = models.CharField(max_length=50, choices=TIPOS_EVENTO)
    fecha_evento = models.DateTimeField()
    ubicacion = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='eventos')
    plantilla = models.ForeignKey(Plantilla, on_delete=models.SET_NULL, null=True, blank=True)
    fondo_personalizado = models.ImageField(upload_to='eventos/fondos/', null=True, blank=True)
    logo_personalizado = models.ImageField(upload_to='eventos/logos/', null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    guardado_como_borrador = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.titulo} ({self.get_tipo_display()})"

class Invitacion(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('enviada', 'Enviada'),
        ('confirmada', 'Confirmada'),
        ('rechazada', 'Rechazada'),
    )
    FORMATOS = (
        ('pdf', 'PDF'),
        ('png', 'PNG'),
    )
    
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE, related_name='invitaciones')
    estado = models.CharField(max_length=50, choices=ESTADOS, default='pendiente')
    fecha_envio = models.DateTimeField(null=True, blank=True)
    enlace_unico = models.CharField(max_length=255, unique=True, default=uuid.uuid4)
    formato = models.CharField(max_length=50, choices=FORMATOS)
    destinatario_nombre = models.CharField(max_length=100)
    destinatario_email = models.CharField(max_length=100, blank=True, null=True)
    destinatario_telefono = models.CharField(max_length=20, blank=True, null=True)
    metodo_envio = models.CharField(max_length=50, choices=[('email', 'Email'), ('whatsapp', 'WhatsApp')])
    
    def __str__(self):
        return f"Invitación para {self.destinatario_nombre} - {self.evento}"

class Confirmacion(models.Model):
    invitacion = models.OneToOneField(Invitacion, on_delete=models.CASCADE, related_name='confirmacion')
    nombre_invitado = models.CharField(max_length=100)
    acompanantes = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    menu_opcion = models.CharField(max_length=50, blank=True, null=True)
    fecha_respuesta = models.DateTimeField(auto_now_add=True)
    comentarios = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Confirmación de {self.nombre_invitado} para {self.invitacion.evento}"
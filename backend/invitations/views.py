from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from . import models
from .serializers import PlantillaSerializer, EventoSerializer, InvitacionSerializer, ConfirmacionSerializer
from django.utils import timezone
import uuid
from django.http import HttpResponse
import csv
from django.db.models import Q
from django.conf import settings
from .services import enviar_correo, enviar_whatsapp

class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = models.Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    
    def perform_create(self, serializer):
        if self.request.user.is_staff:
            serializer.save(creado_por=self.request.user)
        else:
            from django.utils.timezone import now
            from datetime import timedelta
            serializer.save(
                creado_por=self.request.user,
                es_temporal=True,
                fecha_expiracion=now() + timedelta(hours=48)
            )
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return models.Plantilla.objects.all()
        return models.Plantilla.objects.filter(
            Q(es_publica=True) | 
            Q(es_temporal=True, creado_por=self.request.user)
        )

class EventoViewSet(viewsets.ModelViewSet):
    queryset = models.Evento.objects.all()
    serializer_class = EventoSerializer

    def get_queryset(self):
        return models.Evento.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publicar(self, request, pk=None):
        evento = self.get_object()
        evento.guardado_como_borrador = False
        evento.save()
        return Response({'status': 'Evento publicado'})
    
    @action(detail=True, methods=['post'])
    def guardar_borrador(self, request, pk=None):
        evento = self.get_object()
        evento.guardado_como_borrador = True
        evento.save()
        return Response({'status': 'Evento guardado como borrador'})
    
    @action(detail=True, methods=['post'])
    def guardar_progreso(self, request, pk=None):
        evento = self.get_object()
        evento.ultimo_guardado = timezone.now()
        evento.save()
        return Response({'status': 'Progreso guardado', 'fecha': evento.ultimo_guardado})

class InvitacionViewSet(viewsets.ModelViewSet):
    serializer_class = InvitacionSerializer
    
    def get_queryset(self):
        return models.Invitacion.objects.filter(evento__usuario=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(enlace_unico=str(uuid.uuid4()))
    
    def _enviar_invitacion(self, invitacion):
        evento = invitacion.evento
        mensaje = (
            f"¡Hola {invitacion.destinatario_nombre}!\n\n"
            f"Estás invitado a {evento.titulo} el {evento.fecha_evento.strftime('%d/%m/%Y')}.\n"
            f"Ubicación: {evento.ubicacion}\n\n"
            f"Por favor confirma tu asistencia aquí: {settings.BASE_URL}/confirmar/{invitacion.enlace_unico}"
        )
        
        if invitacion.metodo_envio == 'email' and invitacion.destinatario_email:
            enviar_correo(
                destinatario=invitacion.destinatario_email,
                asunto=f"Invitación a {evento.titulo}",
                mensaje=mensaje
            )
        elif invitacion.metodo_envio == 'whatsapp' and invitacion.destinatario_telefono:
            enviar_whatsapp(
                numero=invitacion.destinatario_telefono,
                mensaje=mensaje
            )
        
        invitacion.estado = 'enviada'
        invitacion.fecha_envio = timezone.now()
        invitacion.save()
    
    @action(detail=True, methods=['post'])
    def enviar(self, request, pk=None):
        invitacion = self.get_object()
        try:
            self._enviar_invitacion(invitacion)
            return Response({'status': 'Invitación enviada'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def reenviar(self, request, pk=None):
        return self.enviar(request, pk)
    
    @action(detail=True, methods=['post'])
    def enviar_recordatorio(self, request, pk=None):
        invitacion = self.get_object()
        try:
            mensaje = (
                f"Recordatorio: ¡Te esperamos en {invitacion.evento.titulo}!\n"
                f"Fecha: {invitacion.evento.fecha_evento.strftime('%d/%m/%Y')}\n"
                f"Ubicación: {invitacion.evento.ubicacion}\n\n"
                f"Por favor confirma tu asistencia si aún no lo has hecho: "
                f"{settings.BASE_URL}/confirmar/{invitacion.enlace_unico}"
            )
            
            if invitacion.metodo_envio == 'email' and invitacion.destinatario_email:
                enviar_correo(
                    destinatario=invitacion.destinatario_email,
                    asunto=f"Recordatorio: {invitacion.evento.titulo}",
                    mensaje=mensaje
                )
            elif invitacion.metodo_envio == 'whatsapp' and invitacion.destinatario_telefono:
                enviar_whatsapp(
                    numero=invitacion.destinatario_telefono,
                    mensaje=mensaje
                )
            
            return Response({'status': 'Recordatorio enviado'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def enviar_masivo(self, request):
        try:
            evento_id = request.data.get('evento_id')
            destinatarios = request.data.get('destinatarios', [])
            
            evento = models.Evento.objects.get(id=evento_id, usuario=request.user)
            invitaciones_creadas = []
            
            for destinatario in destinatarios:
                invitacion = models.Invitacion.objects.create(
                    evento=evento,
                    destinatario_nombre=destinatario['nombre'],
                    destinatario_email=destinatario.get('email'),
                    destinatario_telefono=destinatario.get('telefono'),
                    formato='pdf',
                    metodo_envio=destinatario.get('metodo_envio', 'email')
                )
                invitaciones_creadas.append(invitacion.id)
                self._enviar_invitacion(invitacion)
            
            return Response({
                'status': f'{len(invitaciones_creadas)} invitaciones enviadas',
                'invitaciones': invitaciones_creadas
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ConfirmacionViewSet(viewsets.ModelViewSet):
    serializer_class = ConfirmacionSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return models.Confirmacion.objects.filter(invitacion__evento__usuario=self.request.user)
        return models.Confirmacion.objects.none()
    
    def create(self, request, *args, **kwargs):
        invitacion_id = request.data.get('invitacion')
        if not invitacion_id:
            return Response(
                {'error': 'Se requiere el ID de la invitación'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            invitacion = models.Invitacion.objects.get(id=invitacion_id)
        except models.Invitacion.DoesNotExist:
            return Response(
                {'error': 'Invitación no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        self.context = {'invitacion': invitacion}
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        acompanantes = serializer.validated_data.get('acompanantes', 0)
        if acompanantes > invitacion.max_acompanantes:
            return Response(
                {'error': f'Máximo de acompañantes permitidos: {invitacion.max_acompanantes}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        invitacion.estado = 'confirmada'
        invitacion.save()
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

class ExportarConfirmacionesView(APIView):
    def get(self, request, evento_id):
        try:
            evento = models.Evento.objects.get(id=evento_id, usuario=request.user)
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="confirmaciones_{evento_id}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Nombre', 'Acompañantes', 'Menú', 'Fecha Confirmación', 'Comentarios'])
            
            confirmaciones = models.Confirmacion.objects.filter(invitacion__evento=evento)
            for c in confirmaciones:
                writer.writerow([
                    c.nombre_invitado,
                    c.acompanantes,
                    c.menu_opcion or '',
                    c.fecha_respuesta.strftime('%Y-%m-%d %H:%M'),
                    c.comentarios or ''
                ])
            
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
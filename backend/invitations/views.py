from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Plantilla, Evento, Invitacion, Confirmacion
from .serializers import PlantillaSerializer, EventoSerializer, InvitacionSerializer, ConfirmacionSerializer
from django.utils import timezone
import uuid

class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = Plantilla.objects.all()  # <-- Esto es lo importante
    serializer_class = PlantillaSerializer


    def get_queryset(self):
        if self.request.user.is_staff:
            return Plantilla.objects.all()
        return Plantilla.objects.filter(es_publica=True)

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()  # <-- Esto es lo importante
    serializer_class = EventoSerializer
    
    
    def get_queryset(self):
        return Evento.objects.filter(usuario=self.request.user)
    
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

class InvitacionViewSet(viewsets.ModelViewSet):
    serializer_class = InvitacionSerializer
    
    def get_queryset(self):
        return Invitacion.objects.filter(evento__usuario=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(enlace_unico=str(uuid.uuid4()))
    
    @action(detail=True, methods=['post'])
    def enviar(self, request, pk=None):
        invitacion = self.get_object()
        invitacion.estado = 'enviada'
        invitacion.fecha_envio = timezone.now()
        invitacion.save()
        
        # Lógica de envío real iría aquí
        return Response({'status': 'Invitación enviada'})
    
    @action(detail=True, methods=['post'])
    def reenviar(self, request, pk=None):
        return self.enviar(request, pk)

class ConfirmacionViewSet(viewsets.ModelViewSet):
    serializer_class = ConfirmacionSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Confirmacion.objects.filter(invitacion__evento__usuario=self.request.user)
        return Confirmacion.objects.none()
    
    def create(self, request, *args, **kwargs):
        # Permite crear confirmaciones sin autenticación
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
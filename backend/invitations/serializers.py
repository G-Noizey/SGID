from rest_framework import serializers
from .models import Plantilla, Evento, Invitacion, Confirmacion

class PlantillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantilla
        fields = '__all__'
        read_only_fields = ('creado_por',)

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
        read_only_fields = ('usuario', 'fecha_creacion')

class InvitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitacion
        fields = '__all__'
        read_only_fields = ('enlace_unico', 'estado', 'fecha_envio')

class ConfirmacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Confirmacion
        fields = '__all__'
        read_only_fields = ('fecha_respuesta',)
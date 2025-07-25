from rest_framework import serializers
from .models import Plantilla, Evento, Invitacion, Confirmacion

class PlantillaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plantilla
        fields = '__all__'
        read_only_fields = ('creado_por', 'es_publica', 'es_temporal')  # Modificado

    def validate(self, data):
        # Los clientes solo pueden crear plantillas temporales
        if self.context['request'].user.rol == 'cliente':
            data['es_temporal'] = True
            data['es_publica'] = False
        return data


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
    
    def validate_acompanantes(self, value):
        invitacion = self.context['invitacion']
        if value > invitacion.max_acompanantes:
            raise serializers.ValidationError(
                f'Máximo de acompañantes permitidos: {invitacion.max_acompanantes}'
            )
        return value
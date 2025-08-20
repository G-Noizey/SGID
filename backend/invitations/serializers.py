from rest_framework import serializers
from .models import Plantilla, Evento, Invitacion, Confirmacion, Asset
import base64
from django.core.files.base import ContentFile
import uuid

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'file', 'mime_type', 'original_name', 'created_at']
        read_only_fields = ['id', 'mime_type', 'original_name', 'created_at']

class Base64ImageField(serializers.Field):
    def to_representation(self, value):
        return value

    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            return {
                'content': base64.b64decode(imgstr),
                'content_type': format.split(':')[-1],
                'extension': ext
            }
        return data

class PlantillaSerializer(serializers.ModelSerializer):
    config_diseno = serializers.JSONField()
    assets = AssetSerializer(many=True, read_only=True)

    class Meta:
        model = Plantilla
        fields = '__all__'
        read_only_fields = ('creado_por', 'es_publica', 'es_temporal', 'fecha_creacion', 'assets')

    def create(self, validated_data):
        # Procesar elementos con imágenes
        config_diseno = validated_data.get('config_diseno', {})
        elementos = config_diseno.get('elementos', [])
        
        for elemento in elementos:
            if elemento.get('type') == 'image' and elemento.get('content'):
                # Convertir base64 a información de imagen
                img_data = elemento['content']
                if isinstance(img_data, str) and img_data.startswith('data:image'):
                    format, imgstr = img_data.split(';base64,')
                    ext = format.split('/')[-1]
                    elemento['content'] = {
                        'data': imgstr,
                        'type': format.split(':')[1],
                        'extension': ext
                    }
        
        validated_data['config_diseno'] = config_diseno
        
        # Asignar usuario actual
        user = self.context['request'].user
        validated_data['creado_por'] = user
        
        # Clientes solo pueden crear plantillas temporales
        if user.rol == 'cliente':
            validated_data['es_temporal'] = True
            validated_data['es_publica'] = False
        else:
            validated_data['es_temporal'] = False
            validated_data['es_publica'] = True
        return super().create(validated_data)

class EventoSerializer(serializers.ModelSerializer):
    config_diseno = serializers.SerializerMethodField()

    class Meta:
        model = Evento
        fields = '__all__'
        read_only_fields = ('usuario', 'fecha_creacion', 'ultimo_guardado')

    def get_config_diseno(self, obj):
        return obj.get_config_diseno()

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)

class InvitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitacion
        fields = '__all__'
        read_only_fields = ('enlace_unico', 'estado', 'fecha_envio')

class EventoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ["id", "titulo", "fecha_evento", "ubicacion"]

class ConfirmacionSerializer(serializers.ModelSerializer):
    evento = EventoSimpleSerializer(source="invitacion.evento", read_only=True)
    total_asistentes = serializers.SerializerMethodField()

    class Meta:
        model = Confirmacion
        fields = '__all__'
        read_only_fields = ('fecha_respuesta',)

    def get_total_asistentes(self, obj):
        return 1 + (obj.acompanantes or 0)

    def validate_acompanantes(self, value):
        invitacion = self.context.get('invitacion')
        if invitacion and value > invitacion.max_acompanantes:
            raise serializers.ValidationError(
                f'Máximo de acompañantes permitidos: {invitacion.max_acompanantes}'
            )
        return value
#invitations/views.py
from rest_framework import viewsets, status, permissions
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
import base64
from django.core.files.base import ContentFile
from .pdf_generator import generar_pdf_desde_json
from .pdf_generator import generar_png_desde_json  # importa si aún no lo has hecho

class PlantillaViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para Plantillas con todos los métodos HTTP
    """
    queryset = models.Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def create(self, request, *args, **kwargs):
        # Procesar elementos con imágenes antes de la serialización
        config_diseno = request.data.get('config_diseno', {})
        elementos = config_diseno.get('elementos', [])
        
        for elemento in elementos:
            if elemento.get('type') == 'image' and elemento.get('content'):
                img_data = elemento['content']
                if isinstance(img_data, str) and img_data.startswith('data:image'):
                    format, imgstr = img_data.split(';base64,')
                    ext = format.split('/')[-1]
                    elemento['content'] = {
                        'data': imgstr,
                        'type': format.split(':')[1],
                        'extension': ext
                    }
        
        # Actualizar request.data con config_diseno procesado
        mutable_data = request.data.copy()
        mutable_data['config_diseno'] = config_diseno
        request._full_data = mutable_data
        
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Asigna automáticamente el creador y configura temporalidad"""
        user = self.request.user
        if user.is_staff:
            serializer.save(creado_por=user)
        else:
            serializer.save(
                creado_por=user,
                es_temporal=True,
                fecha_expiracion=timezone.now() + timezone.timedelta(hours=48)
            )

    def get_queryset(self):
        """Filtrado según tipo de usuario"""
        user = self.request.user
        if user.is_staff:
            return models.Plantilla.objects.all()
        return models.Plantilla.objects.filter(
            Q(es_publica=True) | 
            Q(es_temporal=True, creado_por=user)
        )

class EventoViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para Eventos con acciones personalizadas
    """
    serializer_class = EventoSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        """Solo eventos del usuario actual con orden definido"""
        return models.Evento.objects.filter(
            usuario=self.request.user
        ).order_by('-fecha_creacion')  # <- Aquí está el cambio clave

    def perform_create(self, serializer):
        """Asigna automáticamente el usuario creador"""
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def publicar(self, request, pk=None):
        """Publica un evento (cambia estado de borrador)"""
        evento = self.get_object()
        evento.guardado_como_borrador = False
        evento.save()
        return Response({'status': 'Evento publicado'})

    @action(detail=True, methods=['post'])
    def guardar_borrador(self, request, pk=None):
        """Marca un evento como borrador"""
        evento = self.get_object()
        evento.guardado_como_borrador = True
        evento.save()
        return Response({'status': 'Evento guardado como borrador'})

    @action(detail=True, methods=['post'])
    def guardar_progreso(self, request, pk=None):
        """Actualiza la fecha de último guardado"""
        evento = self.get_object()
        evento.ultimo_guardado = timezone.now()
        evento.save()
        return Response({
            'status': 'Progreso guardado', 
            'fecha': evento.ultimo_guardado
        })

class InvitacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para Invitaciones con acciones personalizadas:
    - POST /api/invitaciones/{id}/enviar/
    - POST /api/invitaciones/{id}/reenviar/
    - POST /api/invitaciones/{id}/enviar_recordatorio/
    - POST /api/invitaciones/enviar_masivo/
    """
    serializer_class = InvitacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        """Solo invitaciones de eventos del usuario actual"""
        return models.Invitacion.objects.filter(evento__usuario=self.request.user)

    def perform_create(self, serializer):
        """Genera enlace único automáticamente"""
        serializer.save(enlace_unico=str(uuid.uuid4()))

    def _enviar_invitacion(self, invitacion):
        """Lógica común para enviar invitaciones"""
        evento = invitacion.evento
        config_diseno = evento.get_config_diseno()
    
        imagen_base64 = None
        try:
            for el in config_diseno.get('elementos', []):
                if el.get('type') == 'image':
                    content = el.get('content')
                    if isinstance(content, dict) and 'data' in content and 'type' in content:
                        # Construir data URI con mime-type y base64
                        imagen_base64 = f"data:{content['type']};base64,{content['data']}"
                    elif isinstance(content, str) and content.startswith("data:image"):
                        imagen_base64 = content
                    elif isinstance(content, str):
                        # Caso base64 sin encabezado
                        imagen_base64 = f"data:image/jpeg;base64,{content}"
                    break  # Solo la primera imagen
        except Exception as e:
            print(f"[WARN] No se pudo extraer imagen del evento: {e}")

    
        # Construir HTML
        mensaje_html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #333;">Hola {invitacion.destinatario_nombre},</h2>
              <p>¡Estás invitado al siguiente evento!</p>
    
              <h3 style="color: #2E8B57;">{evento.titulo}</h3>
              <p>{evento.descripcion}</p>
        """
    
        if imagen_base64:
            mensaje_html += f"""
              <div style="text-align: center; margin: 20px 0;">
                <img src="{imagen_base64}" alt="Imagen del evento"
                     style="max-width: 100%; height: auto; border-radius: 10px;" />
              </div>
            """

    
        mensaje_html += f"""
              <p><strong>Fecha:</strong> {evento.fecha_evento.strftime('%d/%m/%Y')}<br>
                 <strong>Ubicación:</strong> {evento.ubicacion}</p>
    
              <p style="margin-top: 20px;">Confirma tu asistencia aquí:</p>
              <p style="text-align: center;">
                <a href="{settings.BASE_URL}/confirmar/{invitacion.enlace_unico}" 
                   style="padding: 10px 20px; background-color: #2E8B57; color: #fff; text-decoration: none; border-radius: 5px;">
                  Confirmar asistencia
                </a>
              </p>
    
              <p style="font-size: 12px; color: #888;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="{settings.BASE_URL}/confirmar/{invitacion.enlace_unico}">{settings.BASE_URL}/confirmar/{invitacion.enlace_unico}</a>
              </p>
            </div>
          </body>
        </html>
        """
    
        print(f"[DEBUG] Método de envío: {invitacion.metodo_envio}")
        print(f"[DEBUG] Teléfono destino: {invitacion.destinatario_telefono}")
        if invitacion.metodo_envio == 'email' and invitacion.destinatario_email:
            enviar_correo(
                destinatario=invitacion.destinatario_email,
                asunto=f"Invitación a {evento.titulo}",
                mensaje_html=mensaje_html
            )
    
        # Envío por WhatsApp
        elif invitacion.metodo_envio == 'whatsapp' and invitacion.destinatario_telefono:
            mensaje_texto = (
                f"🎉 ¡Hola {invitacion.destinatario_nombre}!\n\n"
                f"Estás invitado a *{evento.titulo}*.\n"
                f"{evento.descripcion}\n\n"
                f"📅 Fecha: {evento.fecha_evento.strftime('%d/%m/%Y')}\n"
                f"📍 Ubicación: {evento.ubicacion}\n\n"
                f"✅ Confirma aquí: {settings.BASE_URL}/confirmar/{invitacion.enlace_unico}"
            )
            enviar_whatsapp(
                numero=invitacion.destinatario_telefono,
                mensaje=mensaje_texto
            )
    
        invitacion.estado = 'enviada'
        invitacion.fecha_envio = timezone.now()
        invitacion.save()



    @action(detail=True, methods=['post'])
    def enviar(self, request, pk=None):
        """Envía una invitación por primera vez"""
        invitacion = self.get_object()
        try:
            self._enviar_invitacion(invitacion)
            return Response({'status': 'Invitación enviada'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def reenviar(self, request, pk=None):
        """Reenvía una invitación existente"""
        return self.enviar(request, pk)

    @action(detail=True, methods=['post'])
    def enviar_recordatorio(self, request, pk=None):
        """Envía un recordatorio de invitación"""
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
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def enviar_masivo(self, request):
        try:
            evento_id = request.data.get('evento_id')
            metodo_envio_global = request.data.get('metodo_envio', 'email')  # Default a email
            destinatarios = request.data.get('destinatarios', [])
            
            # Validaciones básicas
            if not evento_id:
                return Response({'error': 'Se requiere el ID del evento'}, status=400)
                
            if not destinatarios or not isinstance(destinatarios, list):
                return Response({'error': 'Se requiere una lista válida de destinatarios'}, status=400)
            
            # Obtener el evento
            try:
                evento = models.Evento.objects.get(id=evento_id, usuario=request.user)
            except models.Evento.DoesNotExist:
                return Response({'error': 'Evento no encontrado o no autorizado'}, status=404)
            
            resultados = {
                'exitosos': [],
                'fallidos': []
            }
            
            for index, dest in enumerate(destinatarios):
                try:
                    # Validar datos del destinatario
                    if not dest.get('nombre'):
                        raise ValueError("Nombre es requerido")
                        
                    # Determinar método de envío
                    metodo_envio = dest.get('metodo_envio', metodo_envio_global)
                    
                    # Validar contacto según método
                    if metodo_envio == 'email' and not dest.get('email'):
                        raise ValueError("Email requerido para envío por correo")
                    elif metodo_envio == 'whatsapp' and not dest.get('telefono'):
                        raise ValueError("Teléfono requerido para envío por WhatsApp")
                    
                    # Crear invitación
                    invitacion = models.Invitacion.objects.create(
                        evento=evento,
                        destinatario_nombre=dest['nombre'],
                        destinatario_email=dest.get('email'),
                        destinatario_telefono=dest.get('telefono'),
                        metodo_envio=metodo_envio,
                        max_acompanantes=dest.get('max_acompanantes', 0)
                    )
                    
                    # Enviar invitación
                    self._enviar_invitacion(invitacion)
                    
                    resultados['exitosos'].append({
                        'indice': index,
                        'id': invitacion.id,
                        'destinatario': dest['nombre']
                    })
                    
                except Exception as e:
                    resultados['fallidos'].append({
                        'indice': index,
                        'destinatario': dest.get('nombre', 'Sin nombre'),
                        'error': str(e)
                    })
                    continue
                
            return Response({
                'status': 'completed',
                'total': len(destinatarios),
                'exitosos': len(resultados['exitosos']),
                'fallidos': len(resultados['fallidos']),
                'detalles': resultados
            })
            
        except Exception as e:
            return Response({
                'error': 'Error interno del servidor',
                'detail': str(e)
            }, status=500)


class ConfirmacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Confirmaciones con validación personalizada:
    - POST /api/confirmaciones/ (crear con validación de acompañantes)
    """
    serializer_class = ConfirmacionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        """Filtrado por usuario organizador o acceso público"""
        if self.request.user.is_authenticated:
            return models.Confirmacion.objects.filter(
                invitacion__evento__usuario=self.request.user
            )
        return models.Confirmacion.objects.none()

    def create(self, request, *args, **kwargs):
        """Crea una confirmación con validación de límites"""
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
    """
    Vista para exportar confirmaciones a CSV:
    - GET /api/eventos/{id}/exportar-confirmaciones/
    """
    permission_classes = [permissions.IsAuthenticated]

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
        except models.Evento.DoesNotExist:
            return Response(
                {'error': 'Evento no encontrado o no autorizado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class GenerarPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            print("Datos recibidos para PDF:", request.data)  # Log para diagnóstico
            pdf = generar_pdf_desde_json(request.data)
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="invitacion.pdf"'
            return response
        except Exception as e:
            print("Error generando PDF:", str(e))  # Log detallado
            return Response(
                {'error': str(e), 'detail': 'Error al generar PDF'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class GenerarPNGView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            png = generar_png_desde_json(data)
            response = HttpResponse(png, content_type='image/png')
            response['Content-Disposition'] = 'attachment; filename="invitacion.png"'
            return response
        except Exception as e:
            return Response({'error': str(e)}, status=500)

# backend/invitations/views.py
import csv
import logging
import uuid
from django.conf import settings
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from . import models
from .serializers import (
    ConfirmacionSerializer,
    EventoSerializer,
    InvitacionSerializer,
    PlantillaSerializer,
)
from .services import enviar_correo, enviar_whatsapp

logger = logging.getLogger(__name__)


class PlantillaViewSet(viewsets.ModelViewSet):
    queryset = models.Plantilla.objects.all()
    serializer_class = PlantillaSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def create(self, request, *args, **kwargs):
        """
        Normaliza imágenes base64 en config_diseno.elementos[] con type:image
        guardando solo data/type/extension para evitar payloads gigantes.
        """
        config_diseno = request.data.get("config_diseno", {})
        elementos = config_diseno.get("elementos", [])

        for elemento in elementos:
            if elemento.get("type") == "image" and elemento.get("content"):
                img_data = elemento["content"]
                if isinstance(img_data, str) and img_data.startswith("data:image"):
                    format, imgstr = img_data.split(";base64,")
                    ext = format.split("/")[-1]
                    elemento["content"] = {
                        "data": imgstr,               # solo la parte base64
                        "type": format.split(":")[1], # p.ej. image/png
                        "extension": ext,             # p.ej. png
                    }

        mutable_data = request.data.copy()
        mutable_data["config_diseno"] = config_diseno
        request._full_data = mutable_data  # mantener compatibilidad con DRF

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_staff:
            serializer.save(creado_por=user)
        else:
            serializer.save(
                creado_por=user,
                es_temporal=True,
                fecha_expiracion=timezone.now() + timezone.timedelta(hours=48),
            )

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return models.Plantilla.objects.all()
        return models.Plantilla.objects.filter(
            Q(es_publica=True) | Q(es_temporal=True, creado_por=user)
        )


class EventoViewSet(viewsets.ModelViewSet):
    serializer_class = EventoSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return models.Evento.objects.filter(usuario=self.request.user).order_by(
            "-fecha_creacion"
        )

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=["post"])
    def publicar(self, request, pk=None):
        evento = self.get_object()
        evento.guardado_como_borrador = False
        evento.save()
        return Response({"status": "Evento publicado"})

    @action(detail=True, methods=["post"])
    def guardar_borrador(self, request, pk=None):
        evento = self.get_object()
        evento.guardado_como_borrador = True
        evento.save()
        return Response({"status": "Evento guardado como borrador"})

    @action(detail=True, methods=["post"])
    def guardar_progreso(self, request, pk=None):
        evento = self.get_object()
        evento.ultimo_guardado = timezone.now()
        evento.save()
        return Response(
            {"status": "Progreso guardado", "fecha": evento.ultimo_guardado}
        )


class InvitacionViewSet(viewsets.ModelViewSet):
    serializer_class = InvitacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return models.Invitacion.objects.filter(evento__usuario=self.request.user)

    def perform_create(self, serializer):
        # generar siempre un enlace único para confirmación pública
        serializer.save(enlace_unico=str(uuid.uuid4()))

    def _link_confirmacion(self, invitacion: models.Invitacion) -> str:
        """Construye el enlace público usando enlace_unico."""
        return f"{settings.FRONTEND_URL}/confirmar/{invitacion.enlace_unico}"

    def _enviar_invitacion(self, invitacion: models.Invitacion):
        """
        Envía la invitación por correo o WhatsApp
        (sin generar PNG/PDF, solo texto/HTML con el enlace único).
        """
        evento = invitacion.evento
        enlace = self._link_confirmacion(invitacion)

        mensaje_html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
            <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #333;">Hola {invitacion.destinatario_nombre},</h2>
              <p>¡Estás invitado a <strong>{evento.titulo}</strong>!</p>
              <p>{evento.descripcion or ""}</p>

              <p><strong>Fecha:</strong> {evento.fecha_evento.strftime('%d/%m/%Y')}<br>
                 <strong>Ubicación:</strong> {evento.ubicacion}</p>

              <p style="margin-top: 20px;">Confirma tu asistencia aquí:</p>
              <p style="text-align: center;">
                <a href="{enlace}" 
                   style="padding: 10px 20px; background-color: #2E8B57; color: #fff; text-decoration: none; border-radius: 5px;">
                  Confirmar asistencia
                </a>
              </p>

              <p style="font-size: 12px; color: #888;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="{enlace}">{enlace}</a>
              </p>
            </div>
          </body>
        </html>
        """

        # Envío por email
        if invitacion.metodo_envio == "email" and invitacion.destinatario_email:
            enviar_correo(
                destinatario=invitacion.destinatario_email,
                asunto=f"Invitación a {evento.titulo}",
                mensaje_html=mensaje_html,
            )
            logger.info(f"Correo enviado a {invitacion.destinatario_email}")

        # Envío por WhatsApp
        elif invitacion.metodo_envio == "whatsapp" and invitacion.destinatario_telefono:
            mensaje_texto = (
                f"🎉 ¡Hola {invitacion.destinatario_nombre}!\n\n"
                f"Estás invitado a *{evento.titulo}*.\n"
                f"{(evento.descripcion or '').strip()}\n\n"
                f"📅 Fecha: {evento.fecha_evento.strftime('%d/%m/%Y')}\n"
                f"📍 Ubicación: {evento.ubicacion}\n\n"
                f"✅ Confirma aquí: {enlace}"
            )
            enviar_whatsapp(
                numero=invitacion.destinatario_telefono,
                mensaje=mensaje_texto,
            )
            logger.info(f"WhatsApp enviado a {invitacion.destinatario_telefono}")

        # Actualizar estado de la invitación
        invitacion.estado = "enviada"
        invitacion.fecha_envio = timezone.now()
        invitacion.save()

    @action(detail=True, methods=["post"])
    def enviar(self, request, pk=None):
        invitacion = self.get_object()
        try:
            self._enviar_invitacion(invitacion)
            return Response({"status": "Invitación enviada"})
        except Exception as e:
            logger.exception("Error al enviar invitación")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"])
    def reenviar(self, request, pk=None):
        # simple alias que reutiliza _enviar_invitacion
        return self.enviar(request, pk)

    @action(detail=True, methods=["post"])
    def enviar_recordatorio(self, request, pk=None):
        invitacion = self.get_object()
        try:
            enlace = self._link_confirmacion(invitacion)
            mensaje = (
                f"Recordatorio: ¡Te esperamos en {invitacion.evento.titulo}!\n"
                f"Fecha: {invitacion.evento.fecha_evento.strftime('%d/%m/%Y')}\n"
                f"Ubicación: {invitacion.evento.ubicacion}\n\n"
                f"Por favor confirma tu asistencia si aún no lo has hecho: {enlace}"
            )

            if invitacion.metodo_envio == "email" and invitacion.destinatario_email:
                # formato HTML básico para recordatorio
                mensaje_html = (
                    f"<p>{mensaje.replace(chr(10), '<br>')}</p>"
                )
                enviar_correo(
                    destinatario=invitacion.destinatario_email,
                    asunto=f"Recordatorio: {invitacion.evento.titulo}",
                    mensaje_html=mensaje_html,
                )
            elif (
                invitacion.metodo_envio == "whatsapp"
                and invitacion.destinatario_telefono
            ):
                enviar_whatsapp(
                    numero=invitacion.destinatario_telefono,
                    mensaje=mensaje,
                )

            return Response({"status": "Recordatorio enviado"})
        except Exception as e:
            logger.exception("Error al enviar recordatorio")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"])
    def enviar_masivo(self, request):
        """
        Crea invitaciones y las envía a una lista de destinatarios.
        Usa la plantilla del evento para copiar config_diseno si existe.
        El enlace de confirmación siempre es con enlace_unico.
        """
        try:
            evento_id = request.data.get("evento_id")
            metodo_envio_global = request.data.get("metodo_envio", "email")
            destinatarios = request.data.get("destinatarios", [])

            if not evento_id:
                return Response({"error": "Se requiere el ID del evento"}, status=400)

            if not destinatarios or not isinstance(destinatarios, list):
                return Response(
                    {"error": "Se requiere una lista válida de destinatarios"},
                    status=400,
                )

            try:
                evento = models.Evento.objects.get(id=evento_id, usuario=request.user)
                config_diseno = (
                    evento.plantilla.config_diseno if evento.plantilla else {}
                )
            except models.Evento.DoesNotExist:
                return Response(
                    {"error": "Evento no encontrado o no autorizado"}, status=404
                )

            resultados = {"exitosos": [], "fallidos": []}

            for index, dest in enumerate(destinatarios):
                try:
                    if not dest.get("nombre"):
                        raise ValueError("Nombre es requerido")

                    metodo_envio = dest.get("metodo_envio", metodo_envio_global)

                    if metodo_envio == "email" and not dest.get("email"):
                        raise ValueError("Email requerido para envío por correo")
                    elif metodo_envio == "whatsapp" and not dest.get("telefono"):
                        raise ValueError("Teléfono requerido para envío por WhatsApp")

                    invitacion = models.Invitacion.objects.create(
                        evento=evento,
                        destinatario_nombre=dest["nombre"],
                        destinatario_email=dest.get("email"),
                        destinatario_telefono=dest.get("telefono"),
                        metodo_envio=metodo_envio,
                        max_acompanantes=dest.get("max_acompanantes", 0),
                        config_diseno=config_diseno,
                        enlace_unico=str(uuid.uuid4()),
                        formato="png",  # valor requerido por el modelo; no usado
                    )

                    self._enviar_invitacion(invitacion)

                    resultados["exitosos"].append(
                        {
                            "indice": index,
                            "id": invitacion.id,
                            "destinatario": dest["nombre"],
                            "enlace": self._link_confirmacion(invitacion),
                        }
                    )

                except Exception as e:
                    resultados["fallidos"].append(
                        {
                            "indice": index,
                            "destinatario": dest.get("nombre", "Sin nombre"),
                            "error": str(e),
                        }
                    )
                    continue

            return Response(
                {
                    "status": "completed",
                    "total": len(destinatarios),
                    "exitosos": len(resultados["exitosos"]),
                    "fallidos": len(resultados["fallidos"]),
                    "detalles": resultados,
                }
            )

        except Exception as e:
            logger.exception("Error interno en envío masivo")
            return Response(
                {"error": "Error interno del servidor", "detail": str(e)},
                status=500,
            )


class ConfirmacionViewSet(viewsets.ModelViewSet):
    serializer_class = ConfirmacionSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return models.Confirmacion.objects.filter(
                invitacion__evento__usuario=self.request.user
            )
        return models.Confirmacion.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Confirma asistencia usando exclusivamente `enlace_unico` de la invitación.
        """
        enlace_unico = request.data.get("enlace_unico")
        if not enlace_unico:
            return Response({"error": "Falta enlace_unico"}, status=400)

        try:
            invitacion = models.Invitacion.objects.get(enlace_unico=enlace_unico)
        except models.Invitacion.DoesNotExist:
            return Response({"error": "Invitación no encontrada"}, status=404)

        # Validar acompañantes
        try:
            acompanantes = int(request.data.get("acompanantes", 0))
        except (TypeError, ValueError):
            acompanantes = 0

        if acompanantes > invitacion.max_acompanantes:
            return Response(
                {
                    "error": f"Máximo de acompañantes permitidos: {invitacion.max_acompanantes}"
                },
                status=400,
            )

        # Datos de confirmación
        confirmacion_data = {
            "invitacion": invitacion.id,
            "nombre_invitado": request.data.get(
                "nombre_invitado", invitacion.destinatario_nombre
            ),
            "acompanantes": acompanantes,
            "menu_opcion": request.data.get("menu_opcion", ""),
            "comentarios": request.data.get("comentarios", ""),
        }

        serializer = self.get_serializer(
            data=confirmacion_data, context={"invitacion": invitacion}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Actualizar estado de la invitación
        invitacion.estado = "confirmada"
        invitacion.save(update_fields=["estado"])

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)


class InvitacionPublicaView(APIView):
    """
    Devuelve los datos públicos de la invitación para el formulario,
    buscando por `enlace_unico` (ruta: /invitaciones/publicas/<enlace_unico>/).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, enlace_unico):
        try:
            invitacion = models.Invitacion.objects.get(enlace_unico=enlace_unico)
            serializer = InvitacionSerializer(invitacion)
            return Response(serializer.data)
        except models.Invitacion.DoesNotExist:
            return Response({"error": "Invitación no encontrada"}, status=404)


class ExportarConfirmacionesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, evento_id):
        try:
            evento = models.Evento.objects.get(id=evento_id, usuario=request.user)

            response = HttpResponse(content_type="text/csv")
            response[
                "Content-Disposition"
            ] = f'attachment; filename="confirmaciones_{evento_id}.csv"'

            writer = csv.writer(response)
            writer.writerow(
                ["Nombre", "Acompañantes", "Menú", "Fecha Confirmación", "Comentarios"]
            )

            confirmaciones = models.Confirmacion.objects.filter(
                invitacion__evento=evento
            ).select_related("invitacion")

            for c in confirmaciones:
                writer.writerow(
                    [
                        c.nombre_invitado,
                        c.acompanantes,
                        c.menu_opcion or "",
                        c.fecha_respuesta.strftime("%Y-%m-%d %H:%M"),
                        c.comentarios or "",
                    ]
                )

            return response
        except models.Evento.DoesNotExist:
            return Response(
                {"error": "Evento no encontrado o no autorizado"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.exception("Error exportando confirmaciones")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

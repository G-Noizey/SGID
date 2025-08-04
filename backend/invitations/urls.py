# invitations/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantillaViewSet, EventoViewSet, InvitacionViewSet, ConfirmacionViewSet
from .views import ExportarConfirmacionesView
from .views import GenerarPDFView
from .views import GenerarPNGView

router = DefaultRouter()
router.register(r'plantillas', PlantillaViewSet, basename='plantilla')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'invitaciones', InvitacionViewSet, basename='invitacion')
router.register(r'confirmaciones', ConfirmacionViewSet, basename='confirmacion')

urlpatterns = [
    path('', include(router.urls)),  # ¡Esta línea es crucial para incluir las rutas del router!
    path('eventos/<int:evento_id>/exportar-confirmaciones/', 
         ExportarConfirmacionesView.as_view(), 
         name='exportar_confirmaciones'),
    path('generar-pdf/', GenerarPDFView.as_view(), name='generar_pdf'),
    path('generar-png/', GenerarPNGView.as_view(), name='generar-png'),
]
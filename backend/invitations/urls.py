from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlantillaViewSet, EventoViewSet, InvitacionViewSet, 
    ConfirmacionViewSet, ExportarConfirmacionesView, 
    InvitacionPublicaView, AssetViewSet
)

router = DefaultRouter()
router.register(r'plantillas', PlantillaViewSet, basename='plantilla')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'invitaciones', InvitacionViewSet, basename='invitacion')
router.register(r'confirmaciones', ConfirmacionViewSet, basename='confirmacion')
router.register(r'assets', AssetViewSet, basename='asset')  # Nueva ruta para assets

urlpatterns = [
    path('', include(router.urls)),
    path(
        'eventos/<int:evento_id>/exportar-confirmaciones/',
        ExportarConfirmacionesView.as_view(),
        name='exportar_confirmaciones'
    ),
    path(
        'invitaciones/publicas/<str:enlace_unico>/',
        InvitacionPublicaView.as_view(),
        name='invitacion-publica'
    ),
]
# invitations/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantillaViewSet, EventoViewSet, InvitacionViewSet, ConfirmacionViewSet
from .views import ExportarConfirmacionesView


router = DefaultRouter()
router.register(r'plantillas', PlantillaViewSet, basename='plantilla')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'invitaciones', InvitacionViewSet, basename='invitacion')
router.register(r'confirmaciones', ConfirmacionViewSet, basename='confirmacion')

urlpatterns = [
    path('eventos/<int:evento_id>/exportar-confirmaciones/', 
         ExportarConfirmacionesView.as_view(), 
         name='exportar_confirmaciones'),
]
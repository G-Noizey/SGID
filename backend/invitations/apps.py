# apps.py (en tu aplicación)
from django.apps import AppConfig

class InvitationsConfig(AppConfig):
    name = 'invitations'
    
    def ready(self):
        import invitations.signals
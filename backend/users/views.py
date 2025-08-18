from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, LoginSerializer
from .models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return super().post(request, *args, **kwargs)

User = get_user_model()
token_generator = PasswordResetTokenGenerator()

# Enviar correo con link de recuperación
from rest_framework.views import APIView

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "El email es requerido"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=404)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

        message = f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 30px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center;">
                            <img src="https://ayuda.anid.cl/hc/article_attachments/4411639711252/mceclip0.png" alt="Logo" style="width: 120px; margin-bottom: 20px;"/>
                            <h2 style="color: #007bff; font-size: 24px; font-weight: bold;">¡Recupera tu Contraseña!</h2>
                        </div>
                        <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                            Estimado usuario,
                        </p>
                        <p style="font-size: 16px; color: #333333; line-height: 1.5;">
                            Hemos recibido una solicitud para restablecer tu contraseña. Si tú hiciste esta solicitud, haz clic en el siguiente enlace para restablecer tu contraseña:
                        </p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="{reset_link}" style="background-color: #28a745; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 18px; font-weight: bold; display: inline-block;">
                                Restablecer Contraseña
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #777777; text-align: center; line-height: 1.5;">
                            Si no solicitaste este cambio, por favor ignora este correo.
                        </p>
                        <footer style="text-align: center; font-size: 12px; color: #999999; margin-top: 30px;">
                            <p>Gracias por usar nuestro servicio.</p>
                            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        </footer>
                    </div>
                </body>
            </html>
        """
        send_mail(
            subject="Recuperación de contraseña",
            message="",
            html_message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        return Response({"message": "Correo de recuperación enviado"}, status=200)

# Restablecer contraseña
class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Token inválido"}, status=400)

        if not token_generator.check_token(user, token):
            return Response({"error": "Token inválido o expirado"}, status=400)

        new_password = request.data.get("new_password")
        if not new_password:
            return Response({"error": "Nueva contraseña requerida"}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Contraseña restablecida exitosamente"}, status=200)
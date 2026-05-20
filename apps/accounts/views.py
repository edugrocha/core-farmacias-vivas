# apps/accounts/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.contrib.auth import get_user_model

from core.permissions import IsProprioUsuarioOuAdmin
from .serializers import (
    RegistroUsuarioSerializer,
    PerfilPublicoSerializer,
    PerfilDetalhadoSerializer,
    CustomTokenObtainPairSerializer,
)

Usuario = get_user_model()


@extend_schema(tags=['auth'])
class LoginView(TokenObtainPairView):
    """
    Autentica o usuário e retorna o par de tokens JWT (access + refresh).
    O token de acesso expira em 8 horas. Use o refresh para renová-lo.
    """
    serializer_class = CustomTokenObtainPairSerializer


@extend_schema(tags=['auth'])
class LogoutView(APIView):
    """
    Invalida o refresh token, efetivando o logout seguro.
    O token é adicionado à blacklist do SimpleJWT.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'detail': 'Logout realizado com sucesso.'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            return Response(
                {'detail': 'Token inválido ou já expirado.'},
                status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=['accounts'])
class RegistroView(generics.CreateAPIView):
    """
    Registra um novo usuário público (tipo: COMUNIDADE).
    Especialistas são promovidos manualmente pelo administrador.
    """
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=['accounts'])
class MeuPerfilView(generics.RetrieveUpdateAPIView):
    """
    Retorna e permite atualizar o perfil do usuário autenticado.
    Usuários só podem ver e editar o próprio perfil.
    """
    serializer_class = PerfilDetalhadoSerializer
    permission_classes = [IsAuthenticated, IsProprioUsuarioOuAdmin]

    def get_object(self):
        return self.request.user
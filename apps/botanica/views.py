# apps/botanica/views.py

from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.permissions import IsEspecialistaOuLeituraPublica
from .models import Planta, FamiliaBotanica
from .serializers import (
    PlantaPublicaSerializer,
    PlantaEspecialistaSerializer,
    FamiliaBotanicaSerializer,
)
from .filters import PlantaFilter


@extend_schema(tags=['botanica'])
class PlantaListCreateView(generics.ListCreateAPIView):
    """
    GET  — Lista pública de plantas com status PUBLICADO.
           Suporta busca por nome, família e nível de toxicidade.
    POST — Cria nova planta (requer perfil especialista).
           Inicia com status RASCUNHO para curadoria posterior.
    """
    permission_classes = [IsEspecialistaOuLeituraPublica]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PlantaFilter
    search_fields  = ['nome_popular', 'outros_nomes', 'nome_cientifico', 'usos_terapeuticos']
    ordering_fields = ['nome_popular', 'nome_cientifico', 'created_at']
    ordering = ['nome_popular']

    def get_queryset(self):
        # Especialistas veem todas; comunidade vê apenas publicadas
        if self.request.user.is_authenticated and self.request.user.is_especialista:
            return Planta.objects.select_related('familia', 'curado_por').all()
        return Planta.objects.select_related('familia').filter(
            status=Planta.StatusCuracao.PUBLICADO
        )

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_especialista:
            return PlantaEspecialistaSerializer
        return PlantaPublicaSerializer


@extend_schema(tags=['botanica'])
class PlantaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    — Detalhe público de uma planta (apenas PUBLICADAS para comunidade).
    PUT/PATCH — Atualiza dados (requer especialista).
    DELETE — Arquiva logicamente (requer especialista; não deleta do banco).
    """
    permission_classes = [IsEspecialistaOuLeituraPublica]
    lookup_field = 'pk'

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_especialista:
            return Planta.objects.select_related('familia', 'curado_por').all()
        return Planta.objects.filter(status=Planta.StatusCuracao.PUBLICADO)

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_especialista:
            return PlantaEspecialistaSerializer
        return PlantaPublicaSerializer

    def perform_destroy(self, instance):
        # Deleção lógica: arquiva em vez de deletar do banco
        instance.status = Planta.StatusCuracao.ARQUIVADO
        instance.save(update_fields=['status', 'updated_at'])


@extend_schema(tags=['botanica'])
class PublicarPlantaView(generics.UpdateAPIView):
    """
    Ação de curadoria: publica uma planta (muda status para PUBLICADO).
    Registra automaticamente o especialista responsável e a data.
    Requer: perfil especialista.
    """
    permission_classes = [IsEspecialistaOuLeituraPublica]
    queryset = Planta.objects.all()
    serializer_class = PlantaEspecialistaSerializer
    http_method_names = ['post']  # Semântica: POST em /publicar/

    def post(self, request, *args, **kwargs):
        from django.utils import timezone
        planta = self.get_object()

        if planta.status == Planta.StatusCuracao.PUBLICADO:
            return Response(
                {'detail': 'Esta planta já está publicada.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        planta.status = Planta.StatusCuracao.PUBLICADO
        planta.curado_por = request.user
        planta.data_curadoria = timezone.now()
        planta.save(update_fields=['status', 'curado_por', 'data_curadoria', 'updated_at'])
        return Response(
            PlantaEspecialistaSerializer(planta).data,
            status=status.HTTP_200_OK
        )


@extend_schema(tags=['botanica'])
class FamiliaBotanicaListView(generics.ListCreateAPIView):
    """Lista e cria famílias botânicas (escrita restrita a especialistas)."""
    queryset = FamiliaBotanica.objects.all()
    serializer_class = FamiliaBotanicaSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome']
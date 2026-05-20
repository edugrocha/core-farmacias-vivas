# apps/inventario/views.py

from rest_framework import generics, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from core.permissions import IsEspecialistaOuLeituraPublica
from .models import ItemInventario
from .serializers import ItemInventarioSerializer, ItemInventarioCreateSerializer


@extend_schema(tags=['inventario'])
class InventarioListCreateView(generics.ListCreateAPIView):
    """
    GET  — Lista o inventário. Filtrável por horto_id e planta_id.
    POST — Adiciona planta ao inventário de um horto (requer especialista).
    """
    permission_classes = [IsEspecialistaOuLeituraPublica]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['horto', 'planta', 'disponibilidade']
    ordering_fields  = ['updated_at', 'horto__nome', 'planta__nome_popular']

    def get_queryset(self):
        return (
            ItemInventario.objects
            .select_related('horto', 'planta', 'atualizado_por')
            .all()
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ItemInventarioCreateSerializer
        return ItemInventarioSerializer

    def perform_create(self, serializer):
        serializer.save(atualizado_por=self.request.user)


@extend_schema(tags=['inventario'])
class InventarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Detalhe, atualização e remoção de um item de inventário.
    Atualização registra automaticamente quem fez a alteração.
    """
    permission_classes = [IsEspecialistaOuLeituraPublica]
    queryset = ItemInventario.objects.select_related('horto', 'planta').all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ItemInventarioCreateSerializer
        return ItemInventarioSerializer

    def perform_update(self, serializer):
        serializer.save(atualizado_por=self.request.user)
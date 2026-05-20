from rest_framework import serializers
from .models import ItemInventario
from apps.botanica.serializers import PlantaPublicaSerializer
from apps.hortos.serializers import HortoGeoSerializer


class ItemInventarioSerializer(serializers.ModelSerializer):
    """Leitura com dados aninhados (para exibição ao usuário)."""
    planta_nome     = serializers.CharField(source='planta.nome_popular', read_only=True)
    planta_cientifico = serializers.CharField(source='planta.nome_cientifico', read_only=True)
    horto_nome      = serializers.CharField(source='horto.nome', read_only=True)
    horto_municipio = serializers.CharField(source='horto.municipio', read_only=True)
    disponibilidade_display = serializers.CharField(
        source='get_disponibilidade_display', read_only=True
    )
    atualizado_por_nome = serializers.CharField(
        source='atualizado_por.get_full_name', read_only=True
    )

    class Meta:
        model  = ItemInventario
        fields = [
            'id', 'horto', 'horto_nome', 'horto_municipio',
            'planta', 'planta_nome', 'planta_cientifico',
            'disponibilidade', 'disponibilidade_display',
            'quantidade_estimada', 'observacoes',
            'atualizado_por_nome', 'updated_at',
        ]


class ItemInventarioCreateSerializer(serializers.ModelSerializer):
    """Escrita simplificada (apenas IDs de FK)."""
    class Meta:
        model  = ItemInventario
        fields = ['horto', 'planta', 'disponibilidade',
                  'quantidade_estimada', 'observacoes']
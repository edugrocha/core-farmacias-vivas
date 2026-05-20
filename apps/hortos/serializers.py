from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Horto, Instituicao


class HortoGeoSerializer(GeoFeatureModelSerializer):
    """
    Serializer GeoJSON — padrão para mapas (Leaflet, Mapbox, etc.).
    O campo 'localizacao' vira um Feature GeoJSON automaticamente.
    Adiciona 'distancia_km' quando a View anota o queryset com .distance().
    """
    distancia_km = serializers.SerializerMethodField()
    instituicao_nome = serializers.CharField(
        source='instituicao.nome', read_only=True
    )

    class Meta:
        model = Horto
        geo_field = 'localizacao'        # Campo que vira geometry no GeoJSON
        fields = [
            'id', 'nome', 'descricao',
            'instituicao_nome',
            'municipio', 'uf', 'logradouro',
            'status', 'horario_funcionamento',
            'foto', 'distancia_km',
        ]
        # NÃO inclui: responsavel (dados pessoais), created_at, updated_at

    def get_distancia_km(self, obj):
        # A view injeta o atributo 'distancia' via .annotate()
        distancia = getattr(obj, 'distancia', None)
        if distancia is not None:
            return round(distancia.km, 2)
        return None
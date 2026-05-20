# apps/hortos/views.py

from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.permissions import IsEspecialistaOuLeituraPublica, IsResponsavelHortoOuAdmin
from .models import Horto, Instituicao
from .serializers import HortoGeoSerializer, InstituicaoSerializer


@extend_schema(tags=['hortos'])
class HortoListCreateView(generics.ListCreateAPIView):
    """
    GET  — Lista todos os hortos ativos. Aberto ao público.
    POST — Cadastra novo horto (requer especialista).
    """
    serializer_class = HortoGeoSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields  = ['nome', 'municipio', 'instituicao__nome']
    ordering_fields = ['nome', 'municipio']

    def get_queryset(self):
        qs = Horto.objects.select_related('instituicao', 'responsavel')
        # Especialistas veem todos; público vê apenas ativos
        if not (self.request.user.is_authenticated and self.request.user.is_especialista):
            qs = qs.filter(status=Horto.StatusHorto.ATIVO)
        return qs


@extend_schema(tags=['hortos'])
class HortoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    — Detalhe de um horto.
    PUT/PATCH — Atualiza (responsável ou admin).
    DELETE — Remove (apenas admin).
    """
    serializer_class = HortoGeoSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica, IsResponsavelHortoOuAdmin]
    queryset = Horto.objects.select_related('instituicao', 'responsavel').all()


@extend_schema(
    tags=['hortos'],
    summary="Busca hortos por proximidade geográfica",
    description=(
        "Retorna hortos dentro do raio especificado, ordenados do mais próximo "
        "ao mais distante. Aceita filtro opcional por planta disponível. "
        "Retorna GeoJSON FeatureCollection compatível com Leaflet/Mapbox."
    ),
    parameters=[
        OpenApiParameter('lat',      OpenApiTypes.FLOAT,  description='Latitude do usuário',  required=True),
        OpenApiParameter('lon',      OpenApiTypes.FLOAT,  description='Longitude do usuário', required=True),
        OpenApiParameter('raio_km',  OpenApiTypes.INT,    description='Raio de busca em km (padrão: 10)', required=False),
        OpenApiParameter('planta_id',OpenApiTypes.INT,    description='Filtrar por planta disponível (ID)', required=False),
    ],
    responses={200: HortoGeoSerializer(many=True)},
)
class HortosProximosView(APIView):
    """
    Endpoint principal de geolocalização do sistema.
    Usa PostGIS para calcular distâncias reais em coordenadas geográficas (WGS84).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # 1. Validação dos parâmetros
        try:
            lat     = float(request.query_params.get('lat'))
            lon     = float(request.query_params.get('lon'))
            raio_km = int(request.query_params.get('raio_km', 10))
        except (TypeError, ValueError):
            return Response(
                {'detail': 'Parâmetros inválidos. Forneça lat, lon numéricos e raio_km inteiro.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return Response(
                {'detail': 'Coordenadas fora do intervalo válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        raio_km = min(raio_km, 100)  # Limita a 100km para evitar queries abusivas

        # 2. Cria o ponto de referência (posição do usuário)
        ponto_usuario = Point(lon, lat, srid=4326)

        # 3. Query geoespacial com PostGIS
        queryset = (
            Horto.objects
            .filter(status=Horto.StatusHorto.ATIVO)
            .filter(localizacao__distance_lte=(ponto_usuario, D(km=raio_km)))
            .annotate(distancia=Distance('localizacao', ponto_usuario))
            .select_related('instituicao')
            .order_by('distancia')
        )

        # 4. Filtro opcional por planta disponível
        planta_id = request.query_params.get('planta_id')
        if planta_id:
            try:
                planta_id = int(planta_id)
                queryset = queryset.filter(
                    inventario__planta_id=planta_id,
                    inventario__disponibilidade__in=['DISPONIVEL', 'ABUNDANTE']
                ).distinct()
            except ValueError:
                return Response(
                    {'detail': 'planta_id deve ser um número inteiro.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 5. Serializa para GeoJSON e retorna
        serializer = HortoGeoSerializer(
            queryset, many=True, context={'request': request}
        )
        return Response({
            'tipo': 'FeatureCollection',
            'total': queryset.count(),
            'raio_km': raio_km,
            'centro': {'lat': lat, 'lon': lon},
            'features': serializer.data,
        })


@extend_schema(tags=['hortos'])
class InstituicaoListCreateView(generics.ListCreateAPIView):
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'tipo']
# apps/hortos/views.py

from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.permissions import IsEspecialistaOuLeituraPublica, IsResponsavelHortoOuAdmin
from .models import Horto, Instituicao
from .serializers import HortoGeoSerializer, HortoSerializer, InstituicaoSerializer


@extend_schema(tags=['hortos'])
class HortoListCreateView(generics.ListCreateAPIView):
    """
    GET  — Lista os hortos cadastrados. Suporta busca e filtro por status/UF/município.
    POST — Cria um novo horto (requer perfil especialista).
    """
    serializer_class = HortoSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'uf', 'municipio', 'instituicao']
    search_fields = ['nome', 'municipio', 'instituicao__nome']
    ordering_fields = ['nome', 'created_at']
    ordering = ['nome']

    def get_queryset(self):
        return Horto.objects.select_related('instituicao', 'responsavel').all()


@extend_schema(tags=['hortos'])
class HortoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET       — Detalhe de um horto.
    PUT/PATCH — Atualiza o horto (apenas o responsável cadastrado ou um administrador).
    DELETE    — Remove o horto (apenas o responsável cadastrado ou um administrador).
    """
    serializer_class = HortoSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica, IsResponsavelHortoOuAdmin]
    queryset = Horto.objects.select_related('instituicao', 'responsavel').all()


@extend_schema(tags=['hortos'])
class InstituicaoListCreateView(generics.ListCreateAPIView):
    """
    GET  — Lista as instituições parceiras.
    POST — Cadastra uma nova instituição (requer perfil especialista).
    """
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'tipo']


@extend_schema(tags=['hortos'])
class InstituicaoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET       — Detalhe de uma instituição.
    PUT/PATCH — Atualiza dados da instituição (requer especialista).
    DELETE    — Remove a instituição (requer especialista; falha se houver hortos vinculados).
    """
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer
    permission_classes = [IsEspecialistaOuLeituraPublica]


@extend_schema(
    tags=['hortos'],
    summary="Localiza todos os hortos ordenados por proximidade do usuário",
    description=(
        "Retorna todos os hortos ativos ordenados do mais próximo ao mais distante "
        "em relação à posição GPS do usuário. Sem limite de raio: o mapa exibe "
        "todos os hortos do sistema. Aceita filtro opcional por planta disponível."
    ),
    parameters=[
        OpenApiParameter('lat',       OpenApiTypes.FLOAT, description='Latitude do usuário',  required=True),
        OpenApiParameter('lon',       OpenApiTypes.FLOAT, description='Longitude do usuário', required=True),
        OpenApiParameter('planta_id', OpenApiTypes.INT,   description='Filtrar por ID de planta disponível', required=False),
        OpenApiParameter('municipio', OpenApiTypes.STR,   description='Filtrar por município', required=False),
        OpenApiParameter('uf',        OpenApiTypes.STR,   description='Filtrar por UF (ex: PE)', required=False),
    ],
)
class HortosProximosView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # 1. Validação das coordenadas do usuário
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
        except (TypeError, ValueError):
            return Response(
                {'detail': 'Parâmetros inválidos. Forneça lat e lon numéricos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return Response(
                {'detail': 'Coordenadas fora do intervalo válido (lat: -90..90, lon: -180..180).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Ponto de referência = posição atual do usuário
        ponto_usuario = Point(lon, lat, srid=4326)

        # 3. Todos os hortos ativos, anotados com distância real e ordenados
        queryset = (
            Horto.objects
            .filter(status=Horto.StatusHorto.ATIVO)
            .annotate(distancia=Distance('localizacao', ponto_usuario))
            .select_related('instituicao')
            .order_by('distancia')          # do mais próximo ao mais distante
        )

        # 4. Filtros opcionais
        planta_id = request.query_params.get('planta_id')
        if planta_id:
            try:
                queryset = queryset.filter(
                    inventario__planta_id=int(planta_id),
                    inventario__disponibilidade__in=[
                        'DISPONIVEL', 'ABUNDANTE'
                    ]
                ).distinct()
            except ValueError:
                return Response(
                    {'detail': 'planta_id deve ser um número inteiro.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        municipio = request.query_params.get('municipio')
        if municipio:
            queryset = queryset.filter(municipio__icontains=municipio)

        uf = request.query_params.get('uf')
        if uf:
            queryset = queryset.filter(uf__iexact=uf)

        # 5. Serializa para GeoJSON Feature Collection
        serializer = HortoGeoSerializer(
            queryset, many=True, context={'request': request}
        )

        return Response({
            'type':   'FeatureCollection',
            'total':  queryset.count(),
            'origem': {'lat': lat, 'lon': lon},
            'nota':   'Hortos ordenados do mais próximo ao mais distante. Sem limite de raio.',
            # GeoFeatureModelSerializer com many=True já serializa para um
            # FeatureCollection completo ({'type', 'features': [...]});
            # extraímos apenas a lista para não aninhar duas collections.
            'features': serializer.data['features'],
        })
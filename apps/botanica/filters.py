# apps/botanica/filters.py

import django_filters
from .models import Planta


class PlantaFilter(django_filters.FilterSet):
    nome          = django_filters.CharFilter(field_name='nome_popular', lookup_expr='icontains')
    familia       = django_filters.NumberFilter(field_name='familia__id')
    familia_nome  = django_filters.CharFilter(field_name='familia__nome', lookup_expr='icontains')
    toxicidade    = django_filters.ChoiceFilter(
        field_name='nivel_toxicidade',
        choices=Planta.NivelToxicidade.choices
    )
    status        = django_filters.ChoiceFilter(
        field_name='status',
        choices=Planta.StatusCuracao.choices
    )
    uso           = django_filters.CharFilter(
        field_name='usos_terapeuticos', lookup_expr='icontains'
    )
    regiao        = django_filters.CharFilter(
        field_name='regiao_ocorrencia', lookup_expr='icontains'
    )

    class Meta:
        model  = Planta
        fields = ['nome', 'familia', 'toxicidade', 'status', 'uso', 'regiao']
# apps/hortos/admin.py

from django.contrib.gis import admin as gis_admin
from .models import Horto, Instituicao


@gis_admin.register(Horto)
class HortoAdmin(gis_admin.GISModelAdmin):
    """
    GISModelAdmin exibe um mapa interativo (OpenLayers) no admin
    para posicionar o PointField visualmente.
    """
    list_display  = ['nome', 'municipio', 'uf', 'instituicao', 'status', 'updated_at']
    list_filter   = ['status', 'uf', 'municipio']
    search_fields = ['nome', 'municipio', 'instituicao__nome']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Identificação', {
            'fields': ('nome', 'descricao', 'instituicao', 'responsavel')
        }),
        ('Localização', {
            'fields': ('logradouro', 'municipio', 'uf', 'cep', 'localizacao'),
            'description': 'Clique no mapa para definir a localização exata do horto.'
        }),
        ('Operação', {
            'fields': ('status', 'horario_funcionamento', 'foto')
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@gis_admin.register(Instituicao)
class InstituicaoAdmin(admin.ModelAdmin):
    list_display  = ['nome', 'tipo', 'email_contato', 'telefone']
    search_fields = ['nome', 'tipo']
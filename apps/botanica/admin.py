# apps/botanica/admin.py

from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import Planta, FamiliaBotanica


@admin.register(FamiliaBotanica)
class FamiliaBotanicaAdmin(admin.ModelAdmin):
    list_display  = ['nome', 'descricao']
    search_fields = ['nome']
    ordering      = ['nome']


@admin.register(Planta)
class PlantaAdmin(admin.ModelAdmin):
    list_display = [
        'nome_popular', 'nome_cientifico', 'familia',
        'nivel_toxicidade', 'badge_status', 'curado_por', 'updated_at'
    ]
    list_filter  = ['status', 'nivel_toxicidade', 'familia']
    search_fields = ['nome_popular', 'nome_cientifico', 'outros_nomes']
    readonly_fields = ['created_at', 'updated_at', 'curado_por', 'data_curadoria']
    ordering = ['nome_popular']

    fieldsets = (
        ('Identificação Botânica', {
            'fields': ('nome_popular', 'outros_nomes', 'nome_cientifico', 'familia')
        }),
        ('Informações Terapêuticas', {
            'fields': (
                'descricao', 'parte_utilizada', 'usos_terapeuticos',
                'modo_preparo', 'contraindicacoes', 'interacoes_medicamentosas',
            )
        }),
        ('Segurança e Regulação', {
            'fields': ('nivel_toxicidade', 'referencias_bibliograficas', 'registro_anvisa')
        }),
        ('Distribuição Geográfica', {
            'fields': ('regiao_ocorrencia', 'origem')
        }),
        ('Mídia', {
            'fields': ('foto_principal',)
        }),
        ('Curadoria e Publicação', {
            'fields': ('status', 'curado_por', 'data_curadoria'),
            'classes': ('collapse',),
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    actions = ['publicar_plantas', 'arquivar_plantas', 'enviar_para_revisao']

    def badge_status(self, obj):
        cores = {
            'RASCUNHO':   '#888',
            'EM_REVISAO': '#f0a500',
            'PUBLICADO':  '#2a9d5c',
            'ARQUIVADO':  '#c0392b',
        }
        cor = cores.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:11px">{}</span>',
            cor, obj.get_status_display()
        )
    badge_status.short_description = 'Status'

    @admin.action(description='✅ Publicar plantas selecionadas')
    def publicar_plantas(self, request, queryset):
        atualizadas = queryset.update(
            status='PUBLICADO',
            curado_por=request.user,
            data_curadoria=timezone.now()
        )
        self.message_user(request, f'{atualizadas} planta(s) publicada(s).')

    @admin.action(description='📦 Arquivar plantas selecionadas')
    def arquivar_plantas(self, request, queryset):
        atualizadas = queryset.update(status='ARQUIVADO')
        self.message_user(request, f'{atualizadas} planta(s) arquivada(s).')

    @admin.action(description='🔍 Enviar para revisão')
    def enviar_para_revisao(self, request, queryset):
        atualizadas = queryset.filter(status='RASCUNHO').update(status='EM_REVISAO')
        self.message_user(request, f'{atualizadas} planta(s) enviada(s) para revisão.')
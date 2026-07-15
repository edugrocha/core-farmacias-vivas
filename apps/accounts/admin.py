# apps/accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display  = ['username', 'email', 'get_full_name', 'tipo_perfil', 'is_active', 'date_joined']
    list_filter   = ['tipo_perfil', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    fieldsets = UserAdmin.fieldsets + (
        ('Perfil Farmácias Vivas', {
            'fields': ('tipo_perfil', 'instituicao', 'telefone', 'foto_perfil')
        }),
    )

    actions = ['promover_para_especialista', 'rebaixar_para_comunidade']

    @admin.action(description='⬆️ Promover para Especialista')
    def promover_para_especialista(self, request, queryset):
        queryset.update(tipo_perfil='ESPECIALISTA')
        self.message_user(request, f'{queryset.count()} usuário(s) promovido(s).')

    @admin.action(description='⬇️ Rebaixar para Comunidade')
    def rebaixar_para_comunidade(self, request, queryset):
        queryset.exclude(is_staff=True).update(tipo_perfil='COMUNIDADE')
        self.message_user(request, 'Usuários rebaixados (staff preservado).')
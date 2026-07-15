# apps/inventario/admin.py

from django.contrib import admin
from .models import ItemInventario


@admin.register(ItemInventario)
class ItemInventarioAdmin(admin.ModelAdmin):
    list_display  = [
        'planta', 'horto', 'disponibilidade',
        'quantidade_estimada', 'atualizado_por', 'updated_at'
    ]
    list_filter   = ['disponibilidade', 'horto__municipio']
    search_fields = ['planta__nome_popular', 'horto__nome']
    autocomplete_fields = ['planta', 'horto']
    readonly_fields = ['updated_at', 'atualizado_por']

    def save_model(self, request, obj, form, change):
        obj.atualizado_por = request.user
        super().save_model(request, obj, form, change)
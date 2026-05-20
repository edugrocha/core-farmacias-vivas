from django.db import models
from django.conf import settings


class ItemInventario(models.Model):
    """
    Tabela de junção entre Horto e Planta.
    Responde à pergunta: "Qual horto tem qual planta disponível?"
    """

    class DisponibilidadePlanta(models.TextChoices):
        ABUNDANTE  = 'ABUNDANTE',  'Abundante'
        DISPONIVEL = 'DISPONIVEL', 'Disponível'
        ESCASSA    = 'ESCASSA',    'Escassa'
        INDISPONIVEL = 'INDISPONIVEL', 'Indisponível (fora de época)'

    horto = models.ForeignKey(
        'hortos.Horto',
        on_delete=models.CASCADE,
        related_name='inventario'
    )
    planta = models.ForeignKey(
        'botanica.Planta',
        on_delete=models.CASCADE,
        related_name='inventario'
    )
    disponibilidade = models.CharField(
        max_length=15,
        choices=DisponibilidadePlanta.choices,
        default=DisponibilidadePlanta.DISPONIVEL,
    )
    quantidade_estimada = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Número estimado de espécimes ou mudas disponíveis"
    )
    observacoes = models.TextField(blank=True)
    atualizado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Item de Inventário"
        verbose_name_plural = "Itens de Inventário"
        # Garante que uma planta não seja registrada duas vezes no mesmo horto
        unique_together = ('horto', 'planta')
        ordering = ['horto', 'planta']

    def __str__(self):
        return f"{self.planta.nome_popular} @ {self.horto.nome} [{self.disponibilidade}]"
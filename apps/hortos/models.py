from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings


class Instituicao(models.Model):
    """Entidade responsável pelo horto (IFPE, UBS, ONG, etc.)"""
    nome = models.CharField(max_length=255)
    tipo = models.CharField(
        max_length=100,
        help_text="Ex: Instituto Federal, Unidade Básica de Saúde, ONG"
    )
    site = models.URLField(blank=True)
    email_contato = models.EmailField(blank=True)
    telefone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Instituição"
        verbose_name_plural = "Instituições"
        ordering = ['nome']


class Horto(models.Model):
    """
    Horto medicinal físico com localização geoespacial.
    Requer django.contrib.gis e PostGIS instalado.
    """

    class StatusHorto(models.TextChoices):
        ATIVO    = 'ATIVO',    'Ativo'
        INATIVO  = 'INATIVO',  'Inativo'
        MANUTENCAO = 'MANUTENCAO', 'Em Manutenção'

    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True)
    instituicao = models.ForeignKey(
        Instituicao,
        on_delete=models.PROTECT,
        related_name='hortos'
    )
    responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hortos_gerenciados'
    )

    # --- Endereço ---
    logradouro = models.CharField(max_length=255, blank=True)
    municipio = models.CharField(max_length=100, default='Jaboatão dos Guararapes')
    uf = models.CharField(max_length=2, default='PE')
    cep = models.CharField(max_length=10, blank=True)

    # --- CAMPO GEOESPACIAL (requer PostGIS) ---
    localizacao = gis_models.PointField(
        geography=True,          # Usa sistema geográfico WGS84 (GPS)
        srid=4326,                # EPSG:4326 — padrão de lat/lon
        help_text="Longitude, Latitude. Ex: POINT(-35.012 -8.167)"
    )

    # --- Status e Mídia ---
    status = models.CharField(
        max_length=15,
        choices=StatusHorto.choices,
        default=StatusHorto.ATIVO,
    )
    foto = models.ImageField(
        upload_to='hortos/fotos/', blank=True, null=True
    )
    horario_funcionamento = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nome} — {self.municipio}/{self.uf}"

    class Meta:
        verbose_name = "Horto Medicinal"
        verbose_name_plural = "Hortos Medicinais"
        ordering = ['nome']
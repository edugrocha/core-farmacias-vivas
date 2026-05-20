from django.db import models
from django.conf import settings


class FamiliaBotanica(models.Model):
    """Ex: Lamiaceae, Asteraceae"""
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Família Botânica"
        verbose_name_plural = "Famílias Botânicas"
        ordering = ['nome']


class Planta(models.Model):
    """
    Entidade central do sistema.
    Curadoria obrigatória por especialista antes de publicação.
    """

    class NivelToxicidade(models.TextChoices):
        SEGURA       = 'SEGURA',       'Segura para uso geral'
        ATENCAO      = 'ATENCAO',      'Requer atenção (gestantes, crianças)'
        RESTRITA     = 'RESTRITA',     'Uso restrito — apenas com orientação'
        CONTRAINDICADA = 'CONTRAINDICADA', 'Contraindicada para uso popular'

    class StatusCuracao(models.TextChoices):
        RASCUNHO    = 'RASCUNHO',    'Rascunho'
        EM_REVISAO  = 'EM_REVISAO',  'Em Revisão'
        PUBLICADO   = 'PUBLICADO',   'Publicado'
        ARQUIVADO   = 'ARQUIVADO',   'Arquivado'

    # --- Identificação Botânica ---
    nome_popular = models.CharField(
        max_length=255,
        help_text="Nome mais comum na região. Ex: Erva-cidreira"
    )
    outros_nomes = models.CharField(
        max_length=500, blank=True,
        help_text="Nomes regionais separados por vírgula"
    )
    nome_cientifico = models.CharField(
        max_length=255, unique=True,
        help_text="Binômio científico. Ex: Melissa officinalis"
    )
    familia = models.ForeignKey(
        FamiliaBotanica,
        on_delete=models.PROTECT,
        related_name='plantas'
    )

    # --- Descrição e Uso ---
    descricao = models.TextField(
        help_text="Descrição morfológica e características gerais"
    )
    parte_utilizada = models.CharField(
        max_length=255,
        help_text="Ex: folhas, raízes, casca do caule"
    )
    usos_terapeuticos = models.TextField(
        help_text="Indicações terapêuticas com base em evidências"
    )
    modo_preparo = models.TextField(
        blank=True,
        help_text="Chá, tintura, cataplasma, etc. Com dosagem orientativa"
    )
    contraindicacoes = models.TextField(
        blank=True,
        help_text="Grupos de risco e situações de contraindicação"
    )
    interacoes_medicamentosas = models.TextField(
        blank=True,
        help_text="Interações com fármacos conhecidas"
    )

    # --- Classificação de Segurança ---
    nivel_toxicidade = models.CharField(
        max_length=20,
        choices=NivelToxicidade.choices,
        default=NivelToxicidade.ATENCAO,
    )

    # --- Origem e Distribuição ---
    regiao_ocorrencia = models.CharField(max_length=255, blank=True)
    origem = models.CharField(
        max_length=255, blank=True,
        help_text="Ex: Nativa da Mata Atlântica, Exótica da Ásia"
    )

    # --- Referências Científicas ---
    referencias_bibliograficas = models.TextField(
        blank=True,
        help_text="Artigos, farmacopeias, RDC Anvisa de referência"
    )
    registro_anvisa = models.CharField(
        max_length=100, blank=True,
        help_text="Número de registro ou instrumento normativo da Anvisa"
    )

    # --- Mídia ---
    foto_principal = models.ImageField(
        upload_to='plantas/fotos/', blank=True, null=True
    )

    # --- Controle de Curadoria ---
    status = models.CharField(
        max_length=15,
        choices=StatusCuracao.choices,
        default=StatusCuracao.RASCUNHO,
    )
    curado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='plantas_curadas',
        help_text="Especialista responsável pela validação"
    )
    data_curadoria = models.DateTimeField(null=True, blank=True)

    # --- Auditoria ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nome_popular} ({self.nome_cientifico})"

    class Meta:
        verbose_name = "Planta Medicinal"
        verbose_name_plural = "Plantas Medicinais"
        ordering = ['nome_popular']
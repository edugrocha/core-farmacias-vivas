from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """
    Substitui o User padrão do Django.
    Definido em settings.py com AUTH_USER_MODEL = 'accounts.Usuario'
    DEVE ser configurado ANTES da primeira migrate.
    """

    class TipoPerfil(models.TextChoices):
        COMUNIDADE  = 'COMUNIDADE',  'Usuário da Comunidade'
        ESPECIALISTA = 'ESPECIALISTA', 'Especialista Técnico/Acadêmico'
        ADMIN       = 'ADMIN',       'Administrador do Sistema'

    tipo_perfil = models.CharField(
        max_length=20,
        choices=TipoPerfil.choices,
        default=TipoPerfil.COMUNIDADE,
    )
    instituicao = models.CharField(
        max_length=255,
        blank=True,
        help_text="Instituição de vínculo (para especialistas)"
    )
    telefone = models.CharField(max_length=20, blank=True)
    foto_perfil = models.ImageField(
        upload_to='perfis/', blank=True, null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_especialista(self):
        return self.tipo_perfil in [
            self.TipoPerfil.ESPECIALISTA,
            self.TipoPerfil.ADMIN
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.tipo_perfil})"

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
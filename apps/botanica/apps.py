# apps/botanica/apps.py

from django.apps import AppConfig


class BotanicaConfig(AppConfig):
    name = 'apps.botanica'
    verbose_name = 'Catálogo Botânico'

    def ready(self):
        import apps.botanica.signals  # noqa: F401 — conecta os signals
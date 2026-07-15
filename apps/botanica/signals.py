# apps/botanica/signals.py

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Planta


@receiver(pre_save, sender=Planta)
def registrar_curadoria_automatica(sender, instance, **kwargs):
    """
    Se o status mudou para PUBLICADO e ainda não tem data de curadoria,
    registra o timestamp automaticamente (para edições via admin ou API).
    """
    if instance.pk:
        try:
            anterior = Planta.objects.get(pk=instance.pk)
            if (anterior.status != 'PUBLICADO'
                    and instance.status == 'PUBLICADO'
                    and not instance.data_curadoria):
                instance.data_curadoria = timezone.now()
        except Planta.DoesNotExist:
            pass


@receiver(post_save, sender=Planta)
def notificar_nova_planta_publicada(sender, instance, created, **kwargs):
    """
    Hook para notificações futuras (e-mail, push) ao publicar uma planta.
    Por ora apenas loga — substituir pelo sistema de notificação escolhido.
    """
    if not created and instance.status == 'PUBLICADO':
        import logging
        logger = logging.getLogger('botanica')
        logger.info(
            'Planta publicada: %s (id=%s) por %s',
            instance.nome_popular, instance.pk,
            instance.curado_por or 'sistema'
        )
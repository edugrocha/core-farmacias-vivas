from rest_framework import serializers
from .models import Planta, FamiliaBotanica


class FamiliaBotanicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamiliaBotanica
        fields = ['id', 'nome', 'descricao']


class PlantaPublicaSerializer(serializers.ModelSerializer):
    """
    Visão PÚBLICA — lida pelo usuário da comunidade.
    Regras:
      - Apenas plantas com status=PUBLICADO chegam aqui (filtrado na View)
      - Campos de auditoria (curado_por, data_curadoria) são OMITIDOS
      - Campos de uso técnico interno são OMITIDOS
      - nivel_toxicidade é incluído com display legível (segurança pública)
    """
    familia = FamiliaBotanicaSerializer(read_only=True)
    nivel_toxicidade_display = serializers.CharField(
        source='get_nivel_toxicidade_display', read_only=True
    )

    class Meta:
        model = Planta
        fields = [
            'id',
            'nome_popular',
            'outros_nomes',
            'nome_cientifico',
            'familia',
            'descricao',
            'parte_utilizada',
            'usos_terapeuticos',
            'modo_preparo',
            'contraindicacoes',
            'interacoes_medicamentosas',
            'nivel_toxicidade',
            'nivel_toxicidade_display',
            'regiao_ocorrencia',
            'origem',
            'foto_principal',
            # NÃO inclui: status, curado_por, data_curadoria,
            #             referencias_bibliograficas (salvo versão futura)
        ]


class PlantaEspecialistaSerializer(serializers.ModelSerializer):
    """
    Visão RESTRITA — usada por especialistas para criar e editar plantas.
    Expõe todos os campos, incluindo os de curadoria.
    O campo curado_por é read_only para evitar auto-atribuição via API;
    a lógica de curadoria fica na View/Service.
    """
    familia_nome = serializers.CharField(
        source='familia.nome', read_only=True
    )
    curado_por_nome = serializers.CharField(
        source='curado_por.get_full_name', read_only=True
    )

    class Meta:
        model = Planta
        fields = '__all__'
        read_only_fields = [
            'curado_por',
            'data_curadoria',
            'created_at',
            'updated_at',
        ]
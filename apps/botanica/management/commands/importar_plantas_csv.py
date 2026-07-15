# apps/botanica/management/commands/importar_plantas_csv.py

import csv
from django.core.management.base import BaseCommand
from apps.botanica.models import Planta, FamiliaBotanica


class Command(BaseCommand):
    help = 'Importa plantas medicinais a partir de um arquivo CSV.'

    def add_arguments(self, parser):
        parser.add_argument('arquivo', type=str, help='Caminho para o CSV')
        parser.add_argument(
            '--publicar', action='store_true',
            help='Publicar automaticamente as plantas importadas'
        )

    def handle(self, *args, **options):
        caminho = options['arquivo']
        publicar = options['publicar']
        criadas = 0
        erros   = 0

        # Colunas esperadas no CSV:
        # nome_popular,nome_cientifico,familia,descricao,parte_utilizada,
        # usos_terapeuticos,modo_preparo,contraindicacoes,nivel_toxicidade,
        # regiao_ocorrencia,origem

        with open(caminho, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, linha in enumerate(reader, start=2):
                try:
                    familia, _ = FamiliaBotanica.objects.get_or_create(
                        nome=linha['familia'].strip()
                    )
                    Planta.objects.update_or_create(
                        nome_cientifico=linha['nome_cientifico'].strip(),
                        defaults={
                            'nome_popular':         linha['nome_popular'].strip(),
                            'familia':              familia,
                            'descricao':            linha.get('descricao', '').strip(),
                            'parte_utilizada':      linha.get('parte_utilizada', '').strip(),
                            'usos_terapeuticos':    linha.get('usos_terapeuticos', '').strip(),
                            'modo_preparo':         linha.get('modo_preparo', '').strip(),
                            'contraindicacoes':     linha.get('contraindicacoes', '').strip(),
                            'nivel_toxicidade':     linha.get('nivel_toxicidade', 'ATENCAO').strip(),
                            'regiao_ocorrencia':    linha.get('regiao_ocorrencia', '').strip(),
                            'origem':               linha.get('origem', '').strip(),
                            'status':               'PUBLICADO' if publicar else 'RASCUNHO',
                        }
                    )
                    criadas += 1
                except Exception as e:
                    self.stderr.write(f'Erro na linha {i}: {e}')
                    erros += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Importação concluída: {criadas} planta(s) importada(s), {erros} erro(s).'
            )
        )
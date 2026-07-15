# apps/hortos/management/commands/seed_hortos_pe.py

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from apps.hortos.models import Horto, Instituicao


HORTOS_INICIAIS = [
    {
        'nome':       'Horto Medicinal IFPE — Jaboatão dos Guararapes',
        'municipio':  'Jaboatão dos Guararapes',
        'uf':         'PE',
        'logradouro': 'Av. Barreto de Menezes, 799 — Prazeres',
        'instituicao': 'IFPE Jaboatão dos Guararapes',
        'tipo_inst':   'Instituto Federal',
        'lat': -8.1674, 'lon': -35.0124,
    },
    {
        'nome':       'Horto Medicinal IFPE — Vitória de Santo Antão',
        'municipio':  'Vitória de Santo Antão',
        'uf':         'PE',
        'logradouro': 'Rodovia BR-232, km 54',
        'instituicao': 'IFPE Vitória de Santo Antão',
        'tipo_inst':   'Instituto Federal',
        'lat': -8.1203, 'lon': -35.2945,
    },
]


class Command(BaseCommand):
    help = 'Popula o banco com os hortos medicinais iniciais do projeto.'

    def handle(self, *args, **options):
        for dado in HORTOS_INICIAIS:
            inst, _ = Instituicao.objects.get_or_create(
                nome=dado['instituicao'],
                defaults={'tipo': dado['tipo_inst']}
            )
            horto, criado = Horto.objects.get_or_create(
                nome=dado['nome'],
                defaults={
                    'municipio':   dado['municipio'],
                    'uf':          dado['uf'],
                    'logradouro':  dado['logradouro'],
                    'instituicao': inst,
                    'status':      'ATIVO',
                    'localizacao': Point(dado['lon'], dado['lat'], srid=4326),
                }
            )
            acao = 'Criado' if criado else 'Já existia'
            self.stdout.write(f'[{acao}] {horto.nome}')

        self.stdout.write(self.style.SUCCESS('Seed de hortos concluído.'))
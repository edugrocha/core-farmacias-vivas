# apps/hortos/tests.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from rest_framework.test import APIClient
from rest_framework import status
from .models import Horto, Instituicao
from apps.botanica.models import Planta, FamiliaBotanica
from apps.inventario.models import ItemInventario

Usuario = get_user_model()


class GeolocationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.instituicao = Instituicao.objects.create(
            nome='IFPE Jaboatão dos Guararapes',
            tipo='Instituto Federal'
        )
        familia = FamiliaBotanica.objects.create(nome='Lamiaceae')
        self.planta = Planta.objects.create(
            nome_popular='Hortelã',
            nome_cientifico='Mentha spicata',
            familia=familia,
            descricao='Digestiva.',
            parte_utilizada='Folhas',
            usos_terapeuticos='Digestão.',
            nivel_toxicidade='SEGURA',
            status='PUBLICADO',
        )
        # Horto próximo (Jaboatão — ~10km do Recife Centro)
        self.horto_proximo = Horto.objects.create(
            nome='Horto IFPE Jaboatão',
            instituicao=self.instituicao,
            municipio='Jaboatão dos Guararapes',
            uf='PE',
            status='ATIVO',
            localizacao=Point(-35.0124, -8.1674, srid=4326),
        )
        # Horto distante (Vitória de Santo Antão — ~50km)
        self.horto_distante = Horto.objects.create(
            nome='Horto IFPE Vitória',
            instituicao=self.instituicao,
            municipio='Vitória de Santo Antão',
            uf='PE',
            status='ATIVO',
            localizacao=Point(-35.2945, -8.1203, srid=4326),
        )
        # Inventário: planta no horto próximo
        ItemInventario.objects.create(
            horto=self.horto_proximo,
            planta=self.planta,
            disponibilidade='DISPONIVEL'
        )

    def test_retorna_todos_os_hortos_sem_limite_de_raio(self):
        """Todos os hortos ativos devem retornar, ordenados por proximidade."""
        resp = self.client.get(
            '/api/v1/hortos/proximos/',
            {'lat': -8.0584, 'lon': -34.8848}   # Recife Centro
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['total'], 2)

    def test_hortos_ordenados_por_distancia_crescente(self):
        """O horto mais próximo deve aparecer primeiro."""
        resp = self.client.get(
            '/api/v1/hortos/proximos/',
            {'lat': -8.0584, 'lon': -34.8848}
        )
        features = resp.data['features']
        dist_0 = features[0]['properties']['distancia_km']
        dist_1 = features[1]['properties']['distancia_km']
        self.assertLessEqual(dist_0, dist_1)

    def test_filtro_por_planta_retorna_apenas_horto_com_estoque(self):
        resp = self.client.get(
            '/api/v1/hortos/proximos/',
            {'lat': -8.0584, 'lon': -34.8848, 'planta_id': self.planta.pk}
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['total'], 1)
        nome = resp.data['features'][0]['properties']['nome']
        self.assertEqual(nome, 'Horto IFPE Jaboatão')

    def test_coordenadas_invalidas_retornam_400(self):
        resp = self.client.get(
            '/api/v1/hortos/proximos/',
            {'lat': 'abc', 'lon': '-34.88'}
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_sem_lat_lon_retorna_400(self):
        resp = self.client.get('/api/v1/hortos/proximos/')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
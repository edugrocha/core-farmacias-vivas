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


class HortoCRUDPermissionTestCase(TestCase):
    """CRUD de /hortos/ — escrita restrita a especialista; edição restrita ao
    responsável cadastrado no horto ou a um admin."""

    def setUp(self):
        self.client = APIClient()
        self.instituicao = Instituicao.objects.create(nome='IFPE', tipo='Instituto Federal')
        self.responsavel = Usuario.objects.create_user(
            username='resp', password='senha1234', tipo_perfil='ESPECIALISTA',
        )
        self.outro_especialista = Usuario.objects.create_user(
            username='outro', password='senha1234', tipo_perfil='ESPECIALISTA',
        )
        self.admin = Usuario.objects.create_user(
            username='admin', password='senha1234', tipo_perfil='ADMIN', is_staff=True,
        )
        self.horto = Horto.objects.create(
            nome='Horto do Responsável', instituicao=self.instituicao,
            responsavel=self.responsavel, municipio='Recife', uf='PE', status='ATIVO',
            localizacao=Point(-34.88, -8.05, srid=4326),
        )

    def test_comunidade_nao_pode_criar_horto(self):
        comunidade = Usuario.objects.create_user(
            username='com', password='senha1234', tipo_perfil='COMUNIDADE',
        )
        self.client.force_authenticate(user=comunidade)
        resp = self.client.post('/api/v1/hortos/', {
            'nome': 'Novo Horto', 'instituicao': self.instituicao.pk,
            'municipio': 'Recife', 'uf': 'PE',
            'localizacao': {'type': 'Point', 'coordinates': [-34.88, -8.05]},
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_especialista_nao_responsavel_nao_pode_editar(self):
        self.client.force_authenticate(user=self.outro_especialista)
        resp = self.client.patch(f'/api/v1/hortos/{self.horto.pk}/', {'nome': 'Renomeado'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_responsavel_pode_editar_proprio_horto(self):
        self.client.force_authenticate(user=self.responsavel)
        resp = self.client.patch(f'/api/v1/hortos/{self.horto.pk}/', {'nome': 'Renomeado'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.horto.refresh_from_db()
        self.assertEqual(self.horto.nome, 'Renomeado')

    def test_admin_pode_editar_qualquer_horto(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(f'/api/v1/hortos/{self.horto.pk}/', {'nome': 'Editado pelo admin'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_leitura_e_publica(self):
        resp = self.client.get(f'/api/v1/hortos/{self.horto.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class InstituicaoCRUDTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.especialista = Usuario.objects.create_user(
            username='especialista', password='senha1234', tipo_perfil='ESPECIALISTA',
        )
        self.instituicao = Instituicao.objects.create(nome='IFPE', tipo='Instituto Federal')

    def test_leitura_e_publica(self):
        resp = self.client.get('/api/v1/instituicoes/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_exclusao_falha_se_houver_horto_vinculado(self):
        Horto.objects.create(
            nome='Horto Vinculado', instituicao=self.instituicao,
            municipio='Recife', uf='PE', status='ATIVO',
            localizacao=Point(-34.88, -8.05, srid=4326),
        )
        self.client.force_authenticate(user=self.especialista)
        # PROTECT no FK Horto.instituicao não é tratado na view: a exclusão
        # propaga um ProtectedError (500). O client precisa não relançar essa
        # exceção como erro de teste para podermos inspecionar a resposta.
        self.client.raise_request_exception = False
        resp = self.client.delete(f'/api/v1/instituicoes/{self.instituicao.pk}/')
        self.assertNotEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(Instituicao.objects.filter(pk=self.instituicao.pk).exists())
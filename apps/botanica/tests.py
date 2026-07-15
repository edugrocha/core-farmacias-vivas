# apps/botanica/tests.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Planta, FamiliaBotanica

Usuario = get_user_model()


class PlantaAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.familia = FamiliaBotanica.objects.create(nome='Lamiaceae')

        # Usuário da comunidade (público)
        self.usuario = Usuario.objects.create_user(
            username='comunidade', password='senha1234',
            tipo_perfil='COMUNIDADE'
        )
        # Especialista
        self.especialista = Usuario.objects.create_user(
            username='especialista', password='senha1234',
            tipo_perfil='ESPECIALISTA'
        )
        # Planta publicada
        self.planta_pub = Planta.objects.create(
            nome_popular='Erva-cidreira',
            nome_cientifico='Melissa officinalis',
            familia=self.familia,
            descricao='Planta aromática calmante.',
            parte_utilizada='Folhas',
            usos_terapeuticos='Ansiedade leve, insônia.',
            nivel_toxicidade='SEGURA',
            status='PUBLICADO',
        )
        # Planta em rascunho
        self.planta_ras = Planta.objects.create(
            nome_popular='Camomila',
            nome_cientifico='Matricaria chamomilla',
            familia=self.familia,
            descricao='Anti-inflamatória e calmante.',
            parte_utilizada='Flores',
            usos_terapeuticos='Cólica, insônia.',
            nivel_toxicidade='SEGURA',
            status='RASCUNHO',
        )

    # ── Listagem Pública ──────────────────────────────────────────
    def test_comunidade_ve_apenas_publicadas(self):
        resp = self.client.get('/api/v1/plantas/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        nomes = [r['nome_popular'] for r in resp.data['resultados']]
        self.assertIn('Erva-cidreira', nomes)
        self.assertNotIn('Camomila', nomes)

    def test_especialista_ve_todas_as_plantas(self):
        self.client.force_authenticate(user=self.especialista)
        resp = self.client.get('/api/v1/plantas/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['paginacao']['total'], 2)

    # ── Criação ──────────────────────────────────────────────────
    def test_comunidade_nao_pode_criar_planta(self):
        self.client.force_authenticate(user=self.usuario)
        resp = self.client.post('/api/v1/plantas/', {
            'nome_popular': 'Alecrim',
            'nome_cientifico': 'Rosmarinus officinalis',
            'familia': self.familia.pk,
            'descricao': 'Estimulante circulatório.',
            'parte_utilizada': 'Ramos',
            'usos_terapeuticos': 'Circulação, memória.',
            'nivel_toxicidade': 'ATENCAO',
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_especialista_pode_criar_planta(self):
        self.client.force_authenticate(user=self.especialista)
        resp = self.client.post('/api/v1/plantas/', {
            'nome_popular': 'Alecrim',
            'nome_cientifico': 'Rosmarinus officinalis',
            'familia': self.familia.pk,
            'descricao': 'Estimulante circulatório.',
            'parte_utilizada': 'Ramos',
            'usos_terapeuticos': 'Circulação, memória.',
            'nivel_toxicidade': 'ATENCAO',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['status'], 'RASCUNHO')  # inicia como rascunho

    # ── Publicação ────────────────────────────────────────────────
    def test_publicar_planta_registra_curador(self):
        self.client.force_authenticate(user=self.especialista)
        resp = self.client.post(f'/api/v1/plantas/{self.planta_ras.pk}/publicar/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.planta_ras.refresh_from_db()
        self.assertEqual(self.planta_ras.status, 'PUBLICADO')
        self.assertEqual(self.planta_ras.curado_por, self.especialista)
        self.assertIsNotNone(self.planta_ras.data_curadoria)

    # ── Busca / Filtros ───────────────────────────────────────────
    def test_busca_por_nome_popular(self):
        resp = self.client.get('/api/v1/plantas/?search=cidreira')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['paginacao']['total'], 1)

    def test_filtro_por_toxicidade(self):
        resp = self.client.get('/api/v1/plantas/?toxicidade=SEGURA')
        nomes = [r['nome_popular'] for r in resp.data['resultados']]
        self.assertIn('Erva-cidreira', nomes)
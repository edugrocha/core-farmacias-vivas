# apps/inventario/tests.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from rest_framework.test import APIClient
from rest_framework import status

from apps.botanica.models import FamiliaBotanica, Planta
from apps.hortos.models import Horto, Instituicao
from .models import ItemInventario

Usuario = get_user_model()


class InventarioAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.comunidade = Usuario.objects.create_user(
            username='comunidade', password='senha1234', tipo_perfil='COMUNIDADE',
        )
        self.especialista = Usuario.objects.create_user(
            username='especialista', password='senha1234', tipo_perfil='ESPECIALISTA',
        )

        familia = FamiliaBotanica.objects.create(nome='Lamiaceae')
        self.planta = Planta.objects.create(
            nome_popular='Hortelã', nome_cientifico='Mentha spicata', familia=familia,
            descricao='Digestiva.', parte_utilizada='Folhas',
            usos_terapeuticos='Digestão.', nivel_toxicidade='SEGURA', status='PUBLICADO',
        )
        instituicao = Instituicao.objects.create(nome='IFPE', tipo='Instituto Federal')
        self.horto = Horto.objects.create(
            nome='Horto Central', instituicao=instituicao, municipio='Jaboatão dos Guararapes',
            uf='PE', status='ATIVO', localizacao=Point(-35.012, -8.167, srid=4326),
        )
        self.item = ItemInventario.objects.create(
            horto=self.horto, planta=self.planta, disponibilidade='DISPONIVEL',
            quantidade_estimada=10,
        )

    # ── Leitura pública ────────────────────────────────────────
    def test_listagem_e_publica(self):
        resp = self.client.get('/api/v1/inventario/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['paginacao']['total'], 1)

    def test_detalhe_inclui_nomes_aninhados(self):
        resp = self.client.get(f'/api/v1/inventario/{self.item.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['planta_nome'], 'Hortelã')
        self.assertEqual(resp.data['horto_nome'], 'Horto Central')

    # ── Escrita restrita a especialista ─────────────────────────
    def test_comunidade_nao_pode_criar_item(self):
        self.client.force_authenticate(user=self.comunidade)
        resp = self.client.post('/api/v1/inventario/', {
            'horto': self.horto.pk, 'planta': self.planta.pk,
            'disponibilidade': 'ESCASSA',
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_especialista_pode_atualizar_e_registra_autor(self):
        self.client.force_authenticate(user=self.especialista)
        resp = self.client.patch(f'/api/v1/inventario/{self.item.pk}/', {
            'disponibilidade': 'ESCASSA',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertEqual(self.item.disponibilidade, 'ESCASSA')
        self.assertEqual(self.item.atualizado_por, self.especialista)

    # ── Regra de negócio: não duplicar planta no mesmo horto ────
    def test_nao_permite_planta_duplicada_no_mesmo_horto(self):
        self.client.force_authenticate(user=self.especialista)
        resp = self.client.post('/api/v1/inventario/', {
            'horto': self.horto.pk, 'planta': self.planta.pk,
            'disponibilidade': 'ABUNDANTE',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_filtro_por_horto(self):
        resp = self.client.get(f'/api/v1/inventario/?horto={self.horto.pk}')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['paginacao']['total'], 1)

    def test_especialista_pode_excluir_item(self):
        self.client.force_authenticate(user=self.especialista)
        resp = self.client.delete(f'/api/v1/inventario/{self.item.pk}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ItemInventario.objects.filter(pk=self.item.pk).exists())

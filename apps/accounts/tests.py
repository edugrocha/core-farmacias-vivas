# apps/accounts/tests.py

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

Usuario = get_user_model()


class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            username='joao', email='joao@test.com',
            password='senha1234', first_name='João',
        )

    def test_registro_cria_usuario_como_comunidade(self):
        resp = self.client.post('/api/v1/auth/registro/', {
            'username':  'maria',
            'email':     'maria@test.com',
            'first_name': 'Maria',
            'last_name':  'Silva',
            'telefone':   '81999990000',
            'password':  'senha5678',
            'password2': 'senha5678',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        novo = Usuario.objects.get(username='maria')
        self.assertEqual(novo.tipo_perfil, 'COMUNIDADE')

    def test_login_retorna_tokens_e_dados_do_usuario(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'username': 'joao',
            'password': 'senha1234',
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access',  resp.data)
        self.assertIn('refresh', resp.data)
        self.assertIn('usuario', resp.data)
        self.assertEqual(resp.data['usuario']['tipo_perfil'], 'COMUNIDADE')

    def test_logout_invalida_refresh_token(self):
        login = self.client.post('/api/v1/auth/login/', {
            'username': 'joao', 'password': 'senha1234',
        })
        refresh = login.data['refresh']
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        resp = self.client.post('/api/v1/auth/logout/', {'refresh': refresh})
        self.assertEqual(resp.status_code, status.HTTP_205_RESET_CONTENT)

    def test_acesso_ao_perfil_sem_autenticacao_retorna_401(self):
        resp = self.client.get('/api/v1/meu-perfil/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
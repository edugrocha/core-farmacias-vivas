# apps/accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('auth/login/',    views.LoginView.as_view(),   name='login'),
    path('auth/logout/',   views.LogoutView.as_view(),  name='logout'),
    path('auth/refresh/',  TokenRefreshView.as_view(),  name='token_refresh'),
    path('auth/registro/', views.RegistroView.as_view(), name='registro'),
    path('meu-perfil/',    views.MeuPerfilView.as_view(), name='meu-perfil'),

    # ── CRUD de perfis (administradores) ────────────────
    path('perfis/',          views.PerfilListView.as_view(),   name='perfis-list'),
    path('perfis/<int:pk>/', views.PerfilDetailView.as_view(), name='perfis-detail'),
]
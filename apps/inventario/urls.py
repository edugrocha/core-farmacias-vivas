# apps/inventario/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('inventario/',          views.InventarioListCreateView.as_view(), name='inventario-list'),
    path('inventario/<int:pk>/', views.InventarioDetailView.as_view(),     name='inventario-detail'),
]
# apps/botanica/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('plantas/',               views.PlantaListCreateView.as_view(), name='plantas-list'),
    path('plantas/<int:pk>/',      views.PlantaDetailView.as_view(),     name='plantas-detail'),
    path('plantas/<int:pk>/publicar/', views.PublicarPlantaView.as_view(), name='plantas-publicar'),
    path('familias/',              views.FamiliaBotanicaListView.as_view(), name='familias-list'),
]
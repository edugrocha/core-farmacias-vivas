# apps/hortos/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('hortos/',           views.HortoListCreateView.as_view(),  name='hortos-list'),
    path('hortos/proximos/',  views.HortosProximosView.as_view(),   name='hortos-proximos'),
    path('hortos/<int:pk>/',  views.HortoDetailView.as_view(),      name='hortos-detail'),
    path('instituicoes/',     views.InstituicaoListCreateView.as_view(), name='instituicoes-list'),
]
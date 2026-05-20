from django.urls import path
from . import views

urlpatterns = [
    path('criar_plantas/', views.criar_planta, name='criar_plantas'),
    path('deletar_planta/<int:id>', views.deletar_planta, name="deletar_planta"),
    path('atualizar_planta/<int:id>', views.atualizar_planta, name="atualizar_planta")
]

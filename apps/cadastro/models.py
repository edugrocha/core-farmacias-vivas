from django.db import models

class CadastroPlantas(models.Model):
    nome = models.CharField(max_length=255)
    nome_cientifico = models.CharField(max_length=255)
    descricao = models.TextField(max_length=255)
    parte_utilizada = models.CharField(max_length=255, blank=True)
    usos = models.TextField(blank=True)
    regiao = models.CharField(max_length=255)
    origem = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True) #salva automaticamente a data e hora de criação do registro (uma única vez).
    updated_at = models.DateTimeField(auto_now=True, null=True) #atualiza automaticamente a data e hora da última alteração do registro (toda vez que salvar).

    def __str__(self):
        return self.nome
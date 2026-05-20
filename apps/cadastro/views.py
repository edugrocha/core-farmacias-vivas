from django.shortcuts import render, redirect, get_object_or_404
from .models import CadastroPlantas

def criar_planta(request):
    if request.method == 'POST':
        CadastroPlantas.objects.create(
            nome=request.POST.get('nome'),
            nome_cientifico=request.POST.get('nome_cientifico'),
            descricao=request.POST.get('descricao'),
            parte_utilizada=request.POST.get('parte_utilizada'),
            usos=request.POST.get('usos'),
            regiao=request.POST.get('regiao'),
            origem=request.POST.get('origem'),
        )
        return redirect('criar_plantas')

    plantas = CadastroPlantas.objects.all()
    return render(request, 'criar_plantas.html', {'plantas': plantas})


def deletar_planta(request, id):
    planta = get_object_or_404(CadastroPlantas, id=id)
    planta.delete()
    return redirect('criar_plantas')


def atualizar_planta(request, id):
    planta = get_object_or_404(CadastroPlantas, id=id)

    if request.method == 'POST':
        planta.nome = request.POST.get('nome')
        planta.nome_cientifico = request.POST.get('nome_cientifico')
        planta.descricao = request.POST.get('descricao')
        planta.parte_utilizada = request.POST.get('parte_utilizada')
        planta.usos = request.POST.get('usos')
        planta.regiao = request.POST.get('regiao')
        planta.origem = request.POST.get('origem')
        planta.save()
        return redirect('criar_plantas')

    return render(request, 'atualizar_planta.html', {'planta': planta})

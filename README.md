# 🌿 API Core - Farmácias Vivas (IFPE)

Bem-vindo ao repositório central do **Core Farmácias Vivas**, a API responsável por gerenciar toda a inteligência e o fluxo de dados do projeto de extensão no Instituto Federal de Pernambuco (IFPE) campus Jaboatão dos Guararapes. 

Este sistema foi projetado para centralizar o catálogo científico das plantas, a gestão geoespacial dos hortos parceiros e o controle de inventário.

## 🏗️ Arquitetura do Projeto

O projeto foi construído utilizando **Django** e **Django Rest Framework (DRF)**, adotando uma arquitetura modular focada em escalabilidade e separação de domínios corporativos:

* **`config/`**: Configurações centrais do Django, com ambientes divididos (`base.py`, `development.py`, `production.py`).
* **`apps/`**: Módulos de domínio da aplicação:
    * `accounts/`: Gestão de usuários, perfis e autenticação (JWT).
    * `botanica/`: Catálogo científico de plantas e usos terapêuticos.
    * `hortos/`: Gestão e localização geoespacial das instituições parceiras.
    * `inventario/`: Controle de estoque de plantas em cada horto.
* **`core/`**: Utilitários transversais (paginação, exceções, permissões customizadas).
* **`requirements/`**: Dependências separadas por ambiente de execução.

## 🚀 Como executar o projeto localmente

As instruções abaixo são otimizadas para ambientes **Windows (PowerShell)**.

### 1. Clonar o repositório
```powershell
git clone https://github.com/SEU-USUARIO/core-farmacias-vivas.git
cd core-farmacias-vivas
```

### 2. Criar e ativar o ambiente virtual (venv)
```powershell
python -m venv venv

# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```
*(Nota: Se houver erro de permissão de script no PowerShell, rode `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` antes de ativar o venv).*

### 3. Instalar as dependências
Como estamos em fase de desenvolvimento, utilizaremos o arquivo específico para este ambiente:
```powershell
pip install -r requirements/development.txt
```

### 4. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseando-se no arquivo de exemplo:
```powershell
cp .env.example .env
```
*Abra o arquivo `.env` gerado e preencha com as suas credenciais locais (Secret Key, URL do banco de dados, etc).*

### 5. Aplicar as migrações no banco de dados
```powershell
python manage.py makemigrations
python manage.py migrate
```

### 6. Iniciar o servidor
```powershell
python manage.py runserver
```
A API estará rodando em `http://127.0.0.1:8000/`.

## 📋 Backlog e Gestão Ágil

O desenvolvimento segue práticas ágeis. Os próximos passos e funcionalidades em desenvolvimento incluem:
- [x] Reestruturação da arquitetura em módulos.
- [ ] Configuração do Custom User Model no app `accounts`.
- [ ] Mapeamento das tabelas de `botanica` (Família, Espécie, Usos).
- [ ] Integração de buscas por proximidade (Geolocalização) no app `hortos`.

---
*Desenvolvido pela gestão técnica do projeto de extensão Farmácias Vivas.*
```
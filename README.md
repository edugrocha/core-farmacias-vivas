# 🌿 Farmácias Vivas (IFPE)

Bem-vindo ao repositório central do **Farmácias Vivas**, sistema responsável por gerenciar toda a inteligência e o fluxo de dados do projeto de extensão no Instituto Federal de Pernambuco (IFPE) campus Jaboatão dos Guararapes.

Este sistema foi projetado para centralizar o catálogo científico das plantas, a gestão geoespacial dos hortos parceiros e o controle de inventário, com uma API REST (Django) e um frontend web (Next.js).

## 🏗️ Arquitetura do Projeto

O backend foi construído utilizando **Django** e **Django Rest Framework (DRF)**, adotando uma arquitetura modular focada em escalabilidade e separação de domínios corporativos. O frontend é uma aplicação **Next.js (App Router)** independente, que consome a API via REST/JWT.

* **`config/`**: Configurações centrais do Django, com ambientes divididos (`base.py`, `development.py`, `production.py`).
* **`apps/`**: Módulos de domínio da aplicação:
    * `accounts/`: Gestão de usuários, perfis (`COMUNIDADE`/`ESPECIALISTA`/`ADMIN`) e autenticação (JWT). Inclui CRUD administrativo de perfis (`/perfis/`).
    * `botanica/`: Catálogo científico de plantas, famílias botânicas e curadoria (rascunho → publicação).
    * `hortos/`: Gestão e localização geoespacial (PostGIS) dos hortos e instituições parceiras, incluindo busca por proximidade.
    * `inventario/`: Controle de estoque de plantas em cada horto.
* **`core/`**: Utilitários transversais (paginação, exceções, permissões customizadas).
* **`requirements/`**: Dependências separadas por ambiente de execução.
* **`frontend/`**: Aplicação Next.js (TypeScript + Tailwind) com catálogo público e painel de gestão para especialistas/administradores. Veja [detalhes abaixo](#-frontend-nextjs).

### Endpoints principais da API (`/api/v1/`)

| Recurso | Rotas |
|---|---|
| Autenticação | `auth/login/`, `auth/logout/`, `auth/refresh/`, `auth/registro/` |
| Perfis | `meu-perfil/`, `perfis/`, `perfis/<id>/` (admin) |
| Plantas | `plantas/`, `plantas/<id>/`, `plantas/<id>/publicar/` |
| Famílias botânicas | `familias/`, `familias/<id>/` |
| Hortos | `hortos/`, `hortos/<id>/`, `hortos/proximos/` |
| Instituições | `instituicoes/`, `instituicoes/<id>/` |
| Inventário | `inventario/`, `inventario/<id>/` |

Documentação interativa (Swagger e Redoc) disponível em `/api/docs/` e `/api/redoc/` com o servidor rodando.

## 🚀 Como executar o backend localmente

Estas instruções foram organizadas para ficarem mais claras e funcionarem tanto em Linux/macOS quanto em Windows PowerShell.

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU-USUARIO/core-farmacias-vivas.git
cd core-farmacias-vivas
```

### 2. Criar e ativar o ambiente virtual
```bash
python -m venv .venv
```

Ative o ambiente conforme o seu sistema:
```bash
# Linux / macOS
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Se o comando `python` não estiver disponível, use `python3`.

### 3. Instalar as dependências
```bash
pip install --upgrade pip
pip install -r requirements/development.txt
```

> **GDAL no Windows**: o pacote `GDAL` do PyPI traz apenas os *bindings* Python — a biblioteca nativa precisa vir de outro lugar. Caso o `pip install` falhe tentando compilar o GDAL (erro pedindo Microsoft C++ Build Tools), instale um wheel pré-compilado do [geospatial-wheels](https://github.com/cgohlke/geospatial-wheels/releases) compatível com sua versão do Python (ex: `gdal-3.12.2-cp312-cp312-win_amd64.whl`) com `pip install caminho/para/o/wheel.whl`. O `config/settings/base.py` já detecta automaticamente o `GDAL_LIBRARY_PATH`/`GEOS_LIBRARY_PATH` a partir do pacote `osgeo` instalado, sem precisar de configuração manual. Em Linux/produção, instale `gdal-bin`/`libgdal-dev` normalmente — essa detecção automática só roda no Windows.

### 4. Configurar as variáveis de ambiente
Copie o arquivo de exemplo para `.env` e ajuste os valores de acordo com o seu ambiente local:
```bash
cp .env.example .env
```

No Windows PowerShell, use:
```powershell
Copy-Item .env.example .env
```

Abra o arquivo `.env` e preencha as informações locais:
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `CORS_ALLOWED_ORIGINS` e `CORS_ALLOW_CREDENTIALS` — origens autorizadas a chamar a API (por padrão, `http://localhost:3000`, usado pelo frontend em desenvolvimento).

### 5. Preparar o banco de dados
Este projeto utiliza PostgreSQL com PostGIS. Crie um banco de dados e ajuste as configurações no arquivo `.env` para apontar para ele.

Exemplo de criação do banco:
```sql
CREATE DATABASE core_farmacias_vivas;
```

Alternativa rápida via Docker (imagem já com PostGIS):
```bash
docker run -d --name farmacias_vivas_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=core_farmacias_vivas \
  -p 5432:5432 \
  postgis/postgis:16-3.4
```

### 6. Aplicar as migrações
```bash
python manage.py migrate
```

Se você alterar modelos no futuro, rode primeiro:
```bash
python manage.py makemigrations
```

### 7. Criar um superusuário (opcional, para acessar `/admin/` e o CRUD de perfis)
```bash
python manage.py createsuperuser
```

### 8. Iniciar o servidor
```bash
python manage.py runserver
```

A API estará disponível em `http://127.0.0.1:8000/`.

## 💻 Frontend (Next.js)

O frontend em `frontend/` é uma aplicação Next.js (App Router, TypeScript, Tailwind CSS) com duas áreas:

- **Catálogo público**: busca de plantas medicinais, detalhe de cada planta, mapa de hortos próximos (geolocalização + React-Leaflet), login e cadastro de usuários.
- **Painel de gestão** (`/painel`, restrito a especialistas/administradores): CRUD completo de Plantas (com ação de publicar), Famílias Botânicas, Hortos, Instituições, Inventário e, para administradores, gestão de Perfis de usuário.

A autenticação usa JWT armazenado em **cookies httpOnly** (nunca em `localStorage`), com rotas internas do Next.js (`/api/auth/*`) atuando como proxy seguro entre o navegador e a API Django.

### Executando o frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # ajuste NEXT_PUBLIC_API_URL se necessário
npm run dev
```

O frontend estará disponível em `http://localhost:3000/`, e espera encontrar a API rodando em `http://127.0.0.1:8000/api/v1` (configurável via `NEXT_PUBLIC_API_URL`).

> **Importante**: com o backend e o frontend em portas/origens diferentes, o Django precisa do `django-cors-headers` habilitado e da origem do frontend (`http://localhost:3000` por padrão) listada em `CORS_ALLOWED_ORIGINS` no `.env` do backend — já configurado por padrão neste repositório.

## ☁️ Deploy do backend (Render)

O backend é hospedado no [Render](https://render.com) via Docker (necessário por causa do GDAL/PostGIS — o runtime Python nativo do Render não traz essas libs nativas). Arquivos envolvidos:

- **`Dockerfile`**: instala GDAL/GEOS/PROJ via `apt` e casa a versão do binding Python dinamicamente (`pip install "GDAL==$(gdal-config --version)")`, evitando fixar uma versão que só existe no Windows. Roda `collectstatic` durante o build (o `preDeployCommand` do Render usa um container descartável, então não dá pra rodar lá).
- **`render.yaml`**: Blueprint com o serviço web (`runtime: docker`), um Postgres gerenciado, e um **Persistent Disk** (1GB, montado em `/data`) para as imagens enviadas (`foto_principal`/`foto`/`foto_perfil`) sobreviverem a redeploys — o filesystem do container em si é efêmero.
- **`.dockerignore`**: mantém a imagem enxuta (não inclui `.venv/`, `frontend/`, mídia local, etc.).

### Passo a passo do primeiro deploy

1. No Render, criar um Blueprint apontando para este repositório (usa `render.yaml` automaticamente).
2. **Antes do primeiro deploy rodar as migrações**: abrir o "PSQL Command" do banco criado (dashboard do Render) e rodar:
   ```sql
   CREATE EXTENSION postgis;
   ```
   Sem isso, a migration do app `hortos` (que cria uma coluna geoespacial) falha.
3. Preencher a env var `CORS_ALLOWED_ORIGINS` (marcada como manual no Blueprint) com a URL do frontend em produção — ex: `https://farmacias-vivas.vercel.app`.
4. Depois do serviço no ar, criar um superusuário rodando `python manage.py createsuperuser` pelo shell do Render (aba "Shell" do serviço).

> **Limitação do Persistent Disk**: só funciona com uma única instância do serviço (sem autoscale horizontal). Suficiente para o tamanho atual do projeto; se isso mudar, migrar `MEDIA_ROOT` para um object storage S3-compatível (Cloudflare R2, AWS S3) é o próximo passo natural.

### Frontend (Vercel)

O `frontend/` é deployado separadamente no Vercel (aponte o "Root Directory" do projeto Vercel para `frontend/`), com `NEXT_PUBLIC_API_URL` apontando para a URL do backend no Render.

## 📋 Backlog e Gestão Ágil

O desenvolvimento segue práticas ágeis. Estado atual das funcionalidades:
- [x] Reestruturação da arquitetura em módulos.
- [x] Configuração do Custom User Model no app `accounts`, com CRUD administrativo de perfis.
- [x] Mapeamento das tabelas de `botanica` (Família, Planta, curadoria com fluxo rascunho → publicado).
- [x] Integração de buscas por proximidade (Geolocalização) no app `hortos`.
- [x] CRUD completo de Hortos, Instituições e Inventário.
- [x] Frontend Next.js com catálogo público e painel de gestão.
- [x] Upload de imagens (foto de planta, horto e perfil) pelos formulários do painel.
- [x] Provisionamento do backend para deploy no Render (Docker + PostGIS + Persistent Disk).
- [ ] Atribuição manual de responsável por horto para especialistas não-administradores.

---
*Desenvolvido pela gestão técnica do projeto de extensão Farmácias Vivas.*

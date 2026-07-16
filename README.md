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

### 4. Configurar as variáveis de ambiente
Copie o arquivo de exemplo para `.env` e ajuste os valores de acordo com o seu ambiente local:
```bash
cp .env.example .env
```

No Windows PowerShell, use:
```powershell
Copy-Item .env.example .env
```

Abra o arquivo `.env` e preencha as informações locais, como `SECRET_KEY`, `DEBUG`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`.

### 5. Preparar o banco de dados
Este projeto utiliza PostgreSQL com PostGIS. Crie um banco de dados e ajuste as configurações no arquivo `.env` para apontar para ele.

Exemplo de criação do banco:
```sql
CREATE DATABASE core_farmacias_vivas;
```

### 6. Aplicar as migrações
```bash
python manage.py migrate
```

Se você alterar modelos no futuro, rode primeiro:
```bash
python manage.py makemigrations
```

### 7. Iniciar o servidor
```bash
python manage.py runserver
```

A API estará disponível em `http://127.0.0.1:8000/`.

## 📋 Backlog e Gestão Ágil

O desenvolvimento segue práticas ágeis. Os próximos passos e funcionalidades em desenvolvimento incluem:
- [x] Reestruturação da arquitetura em módulos.
- [ ] Configuração do Custom User Model no app `accounts`.
- [ ] Mapeamento das tabelas de `botanica` (Família, Espécie, Usos).
- [ ] Integração de buscas por proximidade (Geolocalização) no app `hortos`.

---
*Desenvolvido pela gestão técnica do projeto de extensão Farmácias Vivas.*
```
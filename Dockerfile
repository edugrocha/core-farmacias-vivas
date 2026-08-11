# syntax=docker/dockerfile:1
# check=skip=SecretsUsedInArgOrEnv
#
# Imagem de produção do backend (Django + GeoDjango/PostGIS).
# Runtime alvo: Render (serviço `runtime: docker`, ver render.yaml).
#
# O linter do BuildKit avisa que ENV com SECRET_KEY/DB_PASSWORD "parece"
# segredo — são valores fictícios usados só pelo `collectstatic` no build
# (nenhuma conexão de banco acontece), sempre sobrescritos pelos valores
# reais que o Render injeta em runtime. `check=skip` acima suprime o aviso.

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Libs nativas do GeoDjango (GDAL/GEOS/PROJ) + compiladores.
# Pacotes recomendados pela própria documentação do GeoDjango para Debian/Ubuntu.
RUN apt-get update && apt-get install -y --no-install-recommends \
        binutils \
        gdal-bin \
        libgdal-dev \
        libgeos-dev \
        libproj-dev \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/ requirements/
# O binding Python do GDAL precisa casar exatamente com a versão da lib nativa
# recém-instalada via apt — por isso não fica fixado em requirements/base.txt.
RUN pip install --no-cache-dir -r requirements/production.txt \
    && pip install --no-cache-dir "GDAL==$(gdal-config --version)"

COPY . .

# Valores fictícios só para o `collectstatic` conseguir carregar as settings de
# produção durante o build (nenhuma conexão de banco acontece nesse comando).
# Em runtime, o Render injeta os valores reais, que sobrescrevem estes.
ENV DJANGO_SETTINGS_ENV=production \
    SECRET_KEY=build-time-placeholder \
    ALLOWED_HOSTS=localhost \
    CORS_ALLOWED_ORIGINS=http://localhost \
    DB_NAME=build \
    DB_USER=build \
    DB_PASSWORD=build

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]

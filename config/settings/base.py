# config/settings/base.py

from decouple import config
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1').split(',')

AUTH_USER_MODEL = 'accounts.Usuario'  # CRÍTICO: definir antes de qualquer migrate

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',              # PostGIS
]

THIRD_PARTY_APPS = [
    'corsheaders',
    'rest_framework',
    'rest_framework_gis',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # Para logout seguro
    'drf_spectacular',
    'django_filters',
]

LOCAL_APPS = [
    'apps.accounts',
    'apps.botanica',
    'apps.hortos',
    'apps.inventario',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='127.0.0.1'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# ───────────────────────────────────────────
# GDAL/GEOS — No Windows, o pacote `gdal` (wheel do geospatial-wheels)
# já embute as DLLs; localizamos o diretório instalado dinamicamente
# em vez de fixar caminho de máquina. Em Linux/produção, as libs são
# resolvidas pelo sistema e essa configuração é ignorada.
# ───────────────────────────────────────────
import os as _os

if _os.name == 'nt':
    try:
        from osgeo import gdal as _gdal_probe
        _osgeo_dir = Path(_gdal_probe.__file__).resolve().parent
        GDAL_LIBRARY_PATH = config('GDAL_LIBRARY_PATH', default=str(_osgeo_dir / 'gdal.dll'))
        GEOS_LIBRARY_PATH = config('GEOS_LIBRARY_PATH', default=str(_osgeo_dir / 'geos_c.dll'))
    except ImportError:
        pass

# ───────────────────────────────────────────
# Django REST Framework
# ───────────────────────────────────────────
REST_FRAMEWORK = {
    # JWT como autenticação padrão
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # Endpoints públicos por padrão; restrições definidas por view
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    # Paginação padrão para todas as listagens
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.PaginacaoPadrao',
    'PAGE_SIZE': 20,
    # Filtros
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    # Documentação automática via drf-spectacular
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ───────────────────────────────────────────
# JWT — Configurações de Segurança
# ───────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,       # Gera novo refresh a cada uso
    'BLACKLIST_AFTER_ROTATION': True,    # Invalida o refresh anterior
    'AUTH_HEADER_TYPES': ('Bearer',),
    'UPDATE_LAST_LOGIN': True,
}

# ───────────────────────────────────────────
# drf-spectacular — Swagger/OpenAPI
# ───────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'Farmácias Vivas PE — API',
    'DESCRIPTION': (
        'API do sistema de gestão de hortos medicinais e plantas fitoterapêuticas. '
        'Alinhado às diretrizes do SUS e da Anvisa. '
        'Projeto de extensão IFPE Jaboatão dos Guararapes.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'CONTACT': {'name': 'Equipe Farmácias Vivas', 'email': 'contato@farmaciasvivaspe.edu.br'},
    'LICENSE': {'name': 'MIT'},
    # Agrupa endpoints por app no Swagger UI
    'TAGS': [
        {'name': 'auth',       'description': 'Autenticação e gerenciamento de tokens JWT'},
        {'name': 'accounts',   'description': 'Perfis de usuário'},
        {'name': 'botanica',   'description': 'Catálogo botânico de plantas medicinais'},
        {'name': 'hortos',     'description': 'Gestão e localização de hortos medicinais'},
        {'name': 'inventario', 'description': 'Estoque de plantas por horto'},
    ],
    'COMPONENT_SPLIT_REQUEST': True,
}

MEDIA_URL  = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ───────────────────────────────────────────
# Templates — necessário para django.contrib.admin
# ───────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Recife'
USE_I18N = True
USE_TZ = True

# ───────────────────────────────────────────
# CORS — necessário para o frontend (Next.js, porta separada) consumir a API
# ───────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS', default='http://localhost:3000'
).split(',')
CORS_ALLOW_CREDENTIALS = config('CORS_ALLOW_CREDENTIALS', default=True, cast=bool)
# config/settings/production.py
"""
Overrides carregados apenas quando DJANGO_SETTINGS_ENV=production.
NUNCA habilite DEBUG aqui — em produção, informação de stack trace e
variáveis de ambiente vazando numa página de erro é uma falha de segurança.
"""
from decouple import config

from .base import MIDDLEWARE as _BASE_MIDDLEWARE

DEBUG = False

# Sem valor padrão: em produção o host precisa ser declarado explicitamente.
ALLOWED_HOSTS = config('ALLOWED_HOSTS').split(',')

# Sem valor padrão: a origem de dev (localhost:3000) não deve vazar para produção.
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS').split(',')

# ───────────────────────────────────────────
# HTTPS e cookies seguros
# ───────────────────────────────────────────
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=60 * 60 * 24 * 30, cast=int)  # 30 dias
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'

# Necessário atrás de proxy reverso (nginx, Railway, Render etc.) que termina TLS
# antes de repassar a requisição ao Django por HTTP simples.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ───────────────────────────────────────────
# Arquivos estáticos via WhiteNoise — dispensa servidor web separado só para isso
# ───────────────────────────────────────────
MIDDLEWARE = [
    _BASE_MIDDLEWARE[0],  # SecurityMiddleware
    'whitenoise.middleware.WhiteNoiseMiddleware',
    *_BASE_MIDDLEWARE[1:],
]

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# ───────────────────────────────────────────
# Logging — stdout estruturado (capturado pela plataforma de hospedagem)
# ───────────────────────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

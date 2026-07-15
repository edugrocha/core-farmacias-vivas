# config/settings/__init__.py
"""
Carrega as configurações base e permite sobrescritas por ambiente.
Defina a variável de ambiente DJANGO_SETTINGS_ENV como 'production' ou
'development' para carregar overrides específicos; caso contrário, usa-se
apenas base.py.
"""
from .base import *

import os

_env = os.getenv('DJANGO_SETTINGS_ENV', '').lower()
if _env == 'production':
    try:
        from .production import *
    except Exception:
        # Mantém base se production não estiver definida
        pass
elif _env == 'development':
    try:
        from .development import *
    except Exception:
        pass

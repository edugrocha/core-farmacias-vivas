# core/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsEspecialistaOuAdmin(BasePermission):
    """
    Permite acesso total apenas a usuários com tipo_perfil
    ESPECIALISTA ou ADMIN. Leitura bloqueada — use em conjunto
    com outras permissões quando necessário.
    """
    message = "Acesso restrito a especialistas técnicos e administradores."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_especialista
        )


class IsEspecialistaOuLeituraPublica(BasePermission):
    """
    GET/HEAD/OPTIONS: qualquer um (inclusive não autenticado).
    POST/PUT/PATCH/DELETE: apenas especialistas.
    Padrão para o catálogo botânico e inventário.
    """
    message = "Modificações requerem perfil de especialista."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated
            and request.user.is_especialista
        )


class IsProprioUsuarioOuAdmin(BasePermission):
    """
    O usuário só pode ver/editar o próprio perfil.
    Admins têm acesso irrestrito.
    """
    message = "Você só pode acessar ou modificar o seu próprio perfil."

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj == request.user


class IsResponsavelHortoOuAdmin(BasePermission):
    """
    Modificações em um Horto só são permitidas ao seu responsável
    cadastrado ou a um admin. Especialistas podem apenas ler.
    """
    message = "Apenas o responsável pelo horto ou um administrador pode editá-lo."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        return obj.responsavel == request.user
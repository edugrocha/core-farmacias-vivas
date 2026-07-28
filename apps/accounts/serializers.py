from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

Usuario = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Injeta dados do usuário no payload do JWT para o frontend."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['nome']        = user.get_full_name()
        token['tipo_perfil'] = user.tipo_perfil
        token['email']       = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Adiciona dados do usuário na resposta de login
        data['usuario'] = {
            'id':          self.user.id,
            'nome':        self.user.get_full_name(),
            'email':       self.user.email,
            'tipo_perfil': self.user.tipo_perfil,
        }
        return data


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirmação de senha')

    class Meta:
        model  = Usuario
        fields = ['id', 'username', 'email', 'first_name',
                  'last_name', 'telefone', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password': 'As senhas não coincidem.'})
        return attrs

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)


class PerfilPublicoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Usuario
        fields = ['id', 'first_name', 'last_name', 'instituicao']


class PerfilDetalhadoSerializer(serializers.ModelSerializer):
    """Perfil completo — apenas para o próprio usuário."""
    class Meta:
        model  = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telefone', 'instituicao', 'tipo_perfil', 'foto_perfil',
                  'date_joined']
        read_only_fields = ['username', 'tipo_perfil', 'date_joined']


class PerfilAdminSerializer(serializers.ModelSerializer):
    """CRUD completo de perfis — uso exclusivo de administradores."""
    class Meta:
        model  = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telefone', 'instituicao', 'tipo_perfil', 'foto_perfil',
                  'is_active', 'date_joined']
        read_only_fields = ['username', 'date_joined']


class PerfilAdminCreateSerializer(serializers.ModelSerializer):
    """Criação de perfil por um administrador, com tipo_perfil já definido."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'telefone', 'instituicao', 'tipo_perfil', 'password']

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)
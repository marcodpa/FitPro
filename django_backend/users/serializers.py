from rest_framework import serializers
from .models import User

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'avatar']

class UserSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    trainer_id   = serializers.IntegerField(source='trainer.id', read_only=True)
    clients_count = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id','name','email','role','avatar','bio','weight','height','goal',
                  'trainer','trainer_id','trainer_name','clients_count',
                  'followers_count','following_count',
                  'trainer_request_pending','joined_at','updated_at']
        read_only_fields = ['joined_at','updated_at']

    def get_clients_count(self, obj):
        return obj.clients.count() if obj.role == 'trainer' else 0

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['name','email','password','password2','role']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

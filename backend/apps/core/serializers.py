from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """Сериализатор для задач"""
    
    user = serializers.StringRelatedField(read_only=True)
    is_completed = serializers.ReadOnlyField()

    class Meta:
        model = Task
        fields = (
            'id', 
            'title', 
            'description', 
            'status', 
            'created_at', 
            'updated_at', 
            'user',
            'is_completed'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')

    def validate_title(self, value):
        """Валидация заголовка"""
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Заголовок не может быть пустым")
        return value.strip()

    def validate_status(self, value):
        """Валидация статуса"""
        valid_statuses = ['pending', 'completed']
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Статус должен быть одним из: {', '.join(valid_statuses)}"
            )
        return value


class TaskCreateSerializer(TaskSerializer):
    """Сериализатор для создания задач"""
    
    status = serializers.CharField(default='pending', required=False)
    
    class Meta(TaskSerializer.Meta):
        fields = ('title', 'description', 'status')


class TaskUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления задач"""
    
    class Meta:
        model = Task
        fields = ('title', 'description', 'status')

    def validate_title(self, value):
        """Валидация заголовка"""
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Заголовок не может быть пустым")
        return value.strip() 
from django.shortcuts import render
from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend

from .models import Task
from .serializers import (
    TaskSerializer, 
    TaskCreateSerializer,
    TaskUpdateSerializer
)



class TaskListCreateView(generics.ListCreateAPIView):
    """API для получения списка задач и создания новых задач"""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'status', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Возвращает только задачи текущего пользователя"""
        return Task.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        """Автоматическое назначение текущего пользователя при создании задачи"""
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Создание задачи с дополнительной валидацией"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        task = serializer.instance
        
        return Response({
            'task': TaskSerializer(task).data,
            'message': 'Задача успешно создана'
        }, status=status.HTTP_201_CREATED)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API для получения, обновления и удаления конкретной задачи"""
    
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Возвращает только задачи текущего пользователя"""
        return Task.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.request.method in ['PUT', 'PATCH']:
            return TaskUpdateSerializer
        return TaskSerializer

    def update(self, request, *args, **kwargs):
        """Обновление задачи с дополнительными сообщениями"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()

        return Response({
            'task': TaskSerializer(task).data,
            'message': 'Задача успешно обновлена'
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """Удаление задачи с подтверждающим сообщением"""
        instance = self.get_object()
        instance.delete()
        return Response({
            'message': 'Задача успешно удалена'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_stats_view(request):
    """API для получения статистики задач пользователя"""
    
    user_tasks = Task.objects.filter(user=request.user)
    
    stats = {
        'total_tasks': user_tasks.count(),
        'completed_tasks': user_tasks.filter(status='completed').count(),
        'pending_tasks': user_tasks.filter(status='pending').count(),
    }
    
    stats['completion_rate'] = (
        (stats['completed_tasks'] / stats['total_tasks'] * 100) 
        if stats['total_tasks'] > 0 else 0
    )
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_task_status_view(request, task_id):
    """API для быстрого переключения статуса задачи"""
    
    try:
        task = Task.objects.get(id=task_id, user=request.user)
    except Task.DoesNotExist:
        return Response({
            'error': 'Задача не найдена'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Переключение статуса
    task.status = 'completed' if task.status == 'pending' else 'pending'
    task.save()
    
    return Response({
        'task': TaskSerializer(task).data,
        'message': f'Статус задачи изменен на "{task.get_status_display()}"'
    }, status=status.HTTP_200_OK)

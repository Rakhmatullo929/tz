from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    # Статистика (должна быть перед tasks/<int:pk>/ для правильного роутинга)
    path('tasks/stats/', views.task_stats_view, name='task-stats'),
    
    # Задачи CRUD
    path('tasks/', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:task_id>/toggle/', views.toggle_task_status_view, name='toggle-task-status'),
] 
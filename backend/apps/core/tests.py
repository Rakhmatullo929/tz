from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Task


class TaskModelTest(TestCase):
    """Тесты для модели Task"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
    def test_task_creation(self):
        """Тест создания задачи"""
        task = Task.objects.create(
            title='Test Task',
            description='Test Description',
            user=self.user
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.description, 'Test Description')
        self.assertEqual(task.status, 'pending')
        self.assertEqual(task.user, self.user)
        self.assertFalse(task.is_completed)
    
    def test_task_str_method(self):
        """Тест строкового представления задачи"""
        task = Task.objects.create(
            title='Test Task',
            user=self.user,
            status='completed'
        )
        self.assertEqual(str(task), 'Test Task - Выполнено')
    
    def test_task_is_completed_property(self):
        """Тест свойства is_completed"""
        task = Task.objects.create(
            title='Test Task',
            user=self.user,
            status='completed'
        )
        self.assertTrue(task.is_completed)
        
        task.status = 'pending'
        self.assertFalse(task.is_completed)


class TaskAPITest(APITestCase):
    """Тесты для API задач"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@test.com',
            password='testpass123'
        )
        
        # Создание токена для аутентификации
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Создание тестовых задач
        self.task1 = Task.objects.create(
            title='Task 1',
            description='Description 1',
            user=self.user
        )
        self.task2 = Task.objects.create(
            title='Task 2',
            description='Description 2',
            status='completed',
            user=self.user
        )
        # Задача другого пользователя
        self.other_task = Task.objects.create(
            title='Other Task',
            user=self.other_user
        )
    
    def test_get_tasks_list(self):
        """Тест получения списка задач"""
        url = reverse('task-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Только задачи текущего пользователя
    
    def test_create_task(self):
        """Тест создания задачи"""
        url = reverse('task-list-create')
        data = {
            'title': 'New Task',
            'description': 'New Description'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['task']['title'], 'New Task')
        self.assertEqual(Task.objects.filter(user=self.user).count(), 3)
    
    def test_get_task_detail(self):
        """Тест получения детальной информации о задаче"""
        url = reverse('task-detail', kwargs={'pk': self.task1.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Task 1')
    
    def test_update_task(self):
        """Тест обновления задачи"""
        url = reverse('task-detail', kwargs={'pk': self.task1.pk})
        data = {
            'title': 'Updated Task',
            'status': 'completed'
        }
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['task']['title'], 'Updated Task')
        self.assertEqual(response.data['task']['status'], 'completed')
    
    def test_delete_task(self):
        """Тест удаления задачи"""
        url = reverse('task-detail', kwargs={'pk': self.task1.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Task.objects.filter(pk=self.task1.pk).exists())
    
    def test_toggle_task_status(self):
        """Тест переключения статуса задачи"""
        url = reverse('toggle-task-status', kwargs={'task_id': self.task1.pk})
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, 'completed')
        
        # Переключаем обратно
        response = self.client.patch(url)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, 'pending')
    
    def test_get_task_stats(self):
        """Тест получения статистики задач"""
        url = reverse('task-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_tasks'], 2)
        self.assertEqual(response.data['completed_tasks'], 1)
        self.assertEqual(response.data['pending_tasks'], 1)
        self.assertEqual(response.data['completion_rate'], 50.0)
    
    def test_access_other_user_task(self):
        """Тест доступа к задаче другого пользователя"""
        url = reverse('task-detail', kwargs={'pk': self.other_task.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_filter_tasks_by_status(self):
        """Тест фильтрации задач по статусу"""
        url = reverse('task-list-create')
        response = self.client.get(url, {'status': 'completed'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['status'], 'completed')
    
    def test_search_tasks(self):
        """Тест поиска задач"""
        url = reverse('task-list-create')
        response = self.client.get(url, {'search': 'Task 1'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Task 1')
    
    def test_unauthorized_access(self):
        """Тест неавторизованного доступа"""
        self.client.credentials()  # Убираем токен
        
        url = reverse('task-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TaskValidationTest(APITestCase):
    """Тесты валидации данных задач"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_create_task_without_title(self):
        """Тест создания задачи без заголовка"""
        url = reverse('task-list-create')
        data = {
            'description': 'Description without title'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)
    
    def test_create_task_with_long_title(self):
        """Тест создания задачи с слишком длинным заголовком"""
        url = reverse('task-list-create')
        data = {
            'title': 'x' * 300,  # Превышает максимальную длину
            'description': 'Test description'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_task_with_invalid_status(self):
        """Тест обновления задачи с неверным статусом"""
        task = Task.objects.create(
            title='Test Task',
            user=self.user
        )
        
        url = reverse('task-detail', kwargs={'pk': task.pk})
        data = {
            'status': 'invalid_status'
        }
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

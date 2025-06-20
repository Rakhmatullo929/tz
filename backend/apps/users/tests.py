from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

# Тесты для приложения users будут здесь
# Например, тесты для регистрации, авторизации и профилей пользователей 

class UserRegistrationTest(APITestCase):
    """Тесты для регистрации пользователей"""
    
    def test_user_registration_success(self):
        """Тест успешной регистрации пользователя"""
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'strongpassword123',
            'password_confirm': 'strongpassword123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())
    
    def test_user_registration_password_mismatch(self):
        """Тест регистрации с несовпадающими паролями"""
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'strongpassword123',
            'password_confirm': 'different_password',
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username='newuser').exists())
    
    def test_user_registration_duplicate_username(self):
        """Тест регистрации с уже существующим именем пользователя"""
        # Создаем пользователя
        User.objects.create_user(
            username='existinguser',
            email='existing@test.com',
            password='password123'
        )
        
        url = reverse('user-register')
        data = {
            'username': 'existinguser',
            'email': 'new@test.com',
            'password': 'strongpassword123',
            'password_confirm': 'strongpassword123',
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.filter(username='existinguser').count(), 1)
    
    def test_user_registration_invalid_email(self):
        """Тест регистрации с неверным форматом email"""
        url = reverse('user-register')
        data = {
            'username': 'newuser',
            'email': 'invalid-email',
            'password': 'strongpassword123',
            'password_confirm': 'strongpassword123',
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username='newuser').exists())


class UserLoginTest(APITestCase):
    """Тесты для авторизации пользователей"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
    
    def test_user_login_success(self):
        """Тест успешной авторизации"""
        url = reverse('user-login')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_user_login_wrong_password(self):
        """Тест авторизации с неверным паролем"""
        url = reverse('user-login')
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_user_login_nonexistent_user(self):
        """Тест авторизации несуществующего пользователя"""
        url = reverse('user-login')
        data = {
            'username': 'nonexistent',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_user_login_missing_credentials(self):
        """Тест авторизации без указания учетных данных"""
        url = reverse('user-login')
        data = {
            'username': 'testuser'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class UserProfileTest(APITestCase):
    """Тесты для профиля пользователя"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_get_user_profile(self):
        """Тест получения профиля пользователя"""
        url = reverse('user-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@test.com')
        self.assertEqual(response.data['first_name'], 'Test')
        self.assertEqual(response.data['last_name'], 'User')
    
    def test_get_user_profile_unauthorized(self):
        """Тест получения профиля без авторизации"""
        self.client.credentials()  # Убираем токен
        
        url = reverse('user-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserLogoutTest(APITestCase):
    """Тесты для выхода пользователя"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)
        
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_user_logout_success(self):
        """Тест успешного выхода"""
        url = reverse('user-logout')
        data = {
            'refresh': str(self.refresh)
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
    
    def test_user_logout_without_token(self):
        """Тест выхода без токена"""
        url = reverse('user-logout')
        data = {}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_user_logout_unauthorized(self):
        """Тест выхода без авторизации"""
        self.client.credentials()  # Убираем токен
        
        url = reverse('user-logout')
        data = {
            'refresh': str(self.refresh)
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TokenRefreshTest(APITestCase):
    """Тесты для обновления токенов"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        self.refresh = RefreshToken.for_user(self.user)
    
    def test_token_refresh_success(self):
        """Тест успешного обновления токена"""
        url = reverse('token_refresh')
        data = {
            'refresh': str(self.refresh)
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_token_refresh_invalid_token(self):
        """Тест обновления с неверным токеном"""
        url = reverse('token_refresh')
        data = {
            'refresh': 'invalid_token'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserModelTest(TestCase):
    """Тесты для расширенной функциональности пользователей"""
    
    def test_user_creation(self):
        """Тест создания пользователя"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@test.com')
        self.assertEqual(user.first_name, 'Test')
        self.assertEqual(user.last_name, 'User')
        self.assertTrue(user.check_password('testpass123'))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser) 
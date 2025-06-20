# Архитектура Backend

## Структура приложений

Проект разделен на логические приложения Django для лучшей организации кода:

### 1. `apps/users/` - Управление пользователями
**Назначение:** Всё что связано с пользователями и аутентификацией

**Функционал:**
- Регистрация пользователей (`UserRegistrationView`)
- Авторизация (`login_view`)
- Выход из системы (`logout_view`)
- Профиль пользователя (`user_profile_view`)
- Сериализаторы пользователей (`UserSerializer`, `UserRegistrationSerializer`)

**API Endpoints:**
- `POST /api/v1/auth/register/` - Регистрация
- `POST /api/v1/auth/login/` - Авторизация
- `POST /api/v1/auth/logout/` - Выход
- `POST /api/v1/auth/refresh/` - Обновление токена
- `GET /api/v1/auth/profile/` - Профиль пользователя

### 2. `apps/core/` - Управление задачами
**Назначение:** Основная бизнес-логика приложения - управление задачами

**Функционал:**
- Модель задач (`Task`)
- CRUD операции с задачами (`TaskListCreateView`, `TaskDetailView`)
- Переключение статуса задач (`toggle_task_status_view`)
- Статистика задач (`task_stats_view`)
- Сериализаторы задач (`TaskSerializer`, `TaskCreateSerializer`, `TaskUpdateSerializer`)

**API Endpoints:**
- `GET/POST /api/v1/tasks/` - Список задач / Создание задачи
- `GET/PUT/PATCH/DELETE /api/v1/tasks/{id}/` - Детали задачи
- `POST /api/v1/tasks/{id}/toggle/` - Переключение статуса
- `GET /api/v1/tasks/stats/` - Статистика задач

## Преимущества новой архитектуры

1. **Разделение ответственности** - каждое приложение отвечает за свою область
2. **Модульность** - легко добавлять новые приложения
3. **Переиспользование** - приложение `users` можно использовать в других проектах
4. **Тестирование** - проще писать тесты для каждого модуля отдельно
5. **Масштабируемость** - легко расширять функционал каждого приложения

## Настройки

В `settings.py` приложения зарегистрированы как:
```python
LOCAL_APPS = [
    "apps.core",
    "apps.users",
]
```

В `urls.py` маршруты подключены отдельно:
```python
urlpatterns = [
    path("api/v1/", include("apps.users.urls")),  # Пользователи
    path("api/v1/", include("apps.core.urls")),   # Задачи
]
``` 
# Task Manager - Полнофункциональное веб-приложение для управления задачами

## 📋 Описание проекта

Task Manager — это современное веб-приложение для управления задачами, построенное с использованием Django REST Framework и React. Приложение предоставляет полный CRUD функционал для задач с пользовательской аутентификацией и авторизацией.

## 🏗️ Архитектура проекта

```
tz/
├── backend/          # Django REST API
│   ├── apps/
│   │   ├── core/     # Модели и API для задач
│   │   └── users/    # Аутентификация пользователей
│   ├── config/       # Настройки Django
│   └── requirements.txt
└── frontend/         # React SPA
    ├── src/
    │   ├── components/   # React компоненты
    │   ├── pages/       # Страницы приложения
    │   ├── services/    # API клиенты
    │   └── context/     # React Context
    └── package.json
```

## 🚀 Основные возможности

### Backend (Django REST Framework)
- ✅ **Аутентификация пользователей** с JWT токенами
- ✅ **CRUD операции для задач** (создание, чтение, обновление, удаление)
- ✅ **Фильтрация и поиск** задач по статусу и тексту
- ✅ **Статистика задач** (общее количество, выполненные, процент завершения)
- ✅ **Переключение статуса** задач (pending/completed)
- ✅ **Пагинация** результатов
- ✅ **Валидация данных** на уровне API
- ✅ **CORS настройки** для работы с React

### Frontend (React)
- ✅ **Современный UI** с использованием CSS-in-JS
- ✅ **Маршрутизация** с защищенными роутами
- ✅ **Управление состоянием** через React Context
- ✅ **Формы** регистрации и авторизации
- ✅ **Интерактивные компоненты** для управления задачами
- ✅ **Адаптивный дизайн**
- ✅ **Уведомления** об успешных операциях и ошибках

### Тестирование
- ✅ **Comprehensive тесты для Django API** (модели, views, аутентификация)
- ✅ **React компонент тесты** с Jest и React Testing Library
- ✅ **Тестирование API эндпойнтов**
- ✅ **Тестирование аутентификации и авторизации**

## 🛠️ Технологический стек

### Backend
- **Django 5.2.3** - Web framework
- **Django REST Framework 3.16.0** - API framework
- **Django CORS Headers** - CORS middleware
- **SimpleJWT** - JWT аутентификация
- **Django Filter** - Фильтрация данных
- **SQLite** - База данных (для разработки)

### Frontend
- **React 18.2.0** - UI библиотека
- **React Router DOM 6.3.0** - Маршрутизация
- **Axios 1.4.0** - HTTP клиент
- **React Toastify 9.1.3** - Уведомления
- **Framer Motion 10.16.4** - Анимации
- **React Icons 4.10.1** - Иконки

## 📦 Установка и запуск

### Предварительные требования
- Python 3.8+
- Node.js 16+
- npm или yarn

### Backend Setup

1. **Перейдите в папку backend:**
   ```bash
   cd tz/backend
   ```

2. **Создайте виртуальное окружение:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # На Windows: venv\Scripts\activate
   ```

3. **Установите зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Примените миграции:**
   ```bash
   python manage.py migrate
   ```

5. **Создайте суперпользователя (опционально):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Запустите сервер:**
   ```bash
   python manage.py runserver
   ```

   Backend будет доступен по адресу: http://localhost:8000

### Frontend Setup

1. **Перейдите в папку frontend:**
   ```bash
   cd tz/frontend
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Запустите приложение:**
   ```bash
   npm start
   ```

   Frontend будет доступен по адресу: http://localhost:3000

## 🧪 Запуск тестов

### Backend тесты
```bash
cd tz/backend
python manage.py test
```

### Frontend тесты
```bash
cd tz/frontend
npm test
```

## 📚 API Документация

### Аутентификация

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/auth/register/` | Регистрация пользователя |
| POST | `/api/v1/auth/login/` | Авторизация |
| POST | `/api/v1/auth/logout/` | Выход |
| POST | `/api/v1/auth/refresh/` | Обновление токена |
| GET | `/api/v1/auth/profile/` | Профиль пользователя |

### Задачи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/tasks/` | Список задач |
| POST | `/api/v1/tasks/` | Создание задачи |
| GET | `/api/v1/tasks/{id}/` | Детали задачи |
| PUT/PATCH | `/api/v1/tasks/{id}/` | Обновление задачи |
| DELETE | `/api/v1/tasks/{id}/` | Удаление задачи |
| PATCH | `/api/v1/tasks/{id}/toggle/` | Переключение статуса |
| GET | `/api/v1/tasks/stats/` | Статистика задач |

### Примеры запросов

**Регистрация пользователя:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
-H "Content-Type: application/json" \
-d '{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123"
}'
```

**Создание задачи:**
```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "title": "Моя задача",
  "description": "Описание задачи"
}'
```

## 🎯 Основные функции приложения

### 1. Регистрация и авторизация
- Регистрация новых пользователей
- Безопасная авторизация с JWT токенами
- Автоматическое обновление токенов
- Защищенные маршруты

### 2. Управление задачами
- Создание новых задач
- Просмотр списка задач
- Редактирование существующих задач
- Удаление задач
- Быстрое переключение статуса (pending/completed)

### 3. Фильтрация и поиск
- Фильтрация по статусу задач
- Поиск по заголовку и описанию
- Сортировка по дате создания

### 4. Статистика
- Общее количество задач
- Количество выполненных задач
- Процент завершения
- Визуальное отображение прогресса

## 🔧 Настройки разработки

### Backend настройки
- `DEBUG = True` для разработки
- CORS настроен для localhost:3000
- SQLite база данных
- Пагинация: 20 элементов на страницу
- JWT токены: 60 минут для access, 7 дней для refresh

### Frontend настройки
- Прокси на backend через package.json
- Автоматическое обновление токенов
- Обработка ошибок и уведомления
- Адаптивный дизайн

## 🚀 Продакшн развертывание

### Backend
1. Настройте переменные окружения
2. Смените DEBUG на False
3. Настройте базу данных (PostgreSQL)
4. Соберите статические файлы: `python manage.py collectstatic`
5. Используйте WSGI сервер (Gunicorn)

### Frontend
1. Создайте продакшн сборку: `npm run build`
2. Настройте веб-сервер (Nginx)
3. Обновите API URL

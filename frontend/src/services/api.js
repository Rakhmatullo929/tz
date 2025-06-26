import axios from 'axios';
import { toast } from 'react-toastify';

// Базовая конфигурация API
const API_BASE_URL = 'https://api.rakhmatullo.me/api/v1';

// Создание экземпляра axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов и ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('accessToken', access);
          
          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если обновление токена не удалось, выходим из системы
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Показываем уведомление об ошибке
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else if (error.response?.data?.detail) {
      toast.error(error.response.data.detail);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

// API методы для аутентификации
export const authAPI = {
  // Регистрация
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // Вход в систему
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  // Выход из системы
  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },

  // Получение профиля пользователя
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Обновление токена
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh/', { refresh: refreshToken });
    return response.data;
  },
};

// API методы для задач
export const tasksAPI = {
  // Получение списка задач
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks/', { params });
    return response.data;
  },

  // Создание задачи
  createTask: async (taskData) => {
    const response = await api.post('/tasks/', taskData);
    return response.data;
  },

  // Получение конкретной задачи
  getTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/`);
    return response.data;
  },

  // Обновление задачи
  updateTask: async (taskId, taskData) => {
    const response = await api.patch(`/tasks/${taskId}/`, taskData);
    return response.data;
  },

  // Удаление задачи
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}/`);
    return response.data;
  },

  // Переключение статуса задачи
  toggleTaskStatus: async (taskId) => {
    const response = await api.patch(`/tasks/${taskId}/toggle/`);
    return response.data;
  },

  // Получение статистики задач
  getTaskStats: async () => {
    const response = await api.get('/tasks/stats/');
    return response.data;
  },
};

export default api; 
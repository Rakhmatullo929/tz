import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { tasksAPI } from '../services/api';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import TaskStats from '../components/TaskStats';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/TasksPage.css';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [stats, setStats] = useState(null);

  // Загрузка задач
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks();
      setTasks(response.results || response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Ошибка при загрузке задач');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка статистики
  const fetchStats = async () => {
    try {
      const statsData = await tasksAPI.getTaskStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Инициализация данных
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  // Фильтрация и поиск задач
  useEffect(() => {
    let filtered = [...tasks];

    // Поиск по названию и описанию
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Фильтрация по статусу
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, sortBy]);

  // Создание новой задачи
  const handleCreateTask = async (taskData) => {
    try {
      const response = await tasksAPI.createTask(taskData);
      setTasks(prev => [response.task, ...prev]);
      setIsModalOpen(false);
      fetchStats();
      toast.success(response.message || 'Задача создана успешно!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Ошибка при создании задачи');
    }
  };

  // Обновление задачи
  const handleUpdateTask = async (taskData) => {
    try {
      const response = await tasksAPI.updateTask(editingTask.id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? response.task : task
      ));
      setEditingTask(null);
      setIsModalOpen(false);
      fetchStats();
      toast.success(response.message || 'Задача обновлена успешно!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Ошибка при обновлении задачи');
    }
  };

  // Удаление задачи
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      return;
    }

    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      fetchStats();
      toast.success('Задача удалена успешно!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Ошибка при удалении задачи');
    }
  };

  // Переключение статуса задачи
  const handleToggleStatus = async (taskId) => {
    try {
      const response = await tasksAPI.toggleTaskStatus(taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? response.task : task
      ));
      fetchStats();
      toast.success(response.message);
    } catch (error) {
      console.error('Error toggling task status:', error);
      toast.error('Ошибка при изменении статуса задачи');
    }
  };

  // Открытие модального окна для создания задачи
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Открытие модального окна для редактирования задачи
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="tasks-page">
      <div className="tasks-container">
        {/* Заголовок и статистика */}
        <div className="tasks-header">
          <div className="header-content">
            <h1 className="page-title">Мои задачи</h1>
            <p className="page-subtitle">
              Управляйте своими задачами эффективно
            </p>
          </div>
          
          {stats && <TaskStats stats={stats} />}
        </div>

        {/* Панель управления */}
        <div className="tasks-controls">
          <div className="controls-left">
            {/* Поиск */}
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Фильтр по статусу */}
            <div className="filter-group">
              <FiFilter className="filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Все задачи</option>
                <option value="pending">Не выполнено</option>
                <option value="completed">Выполнено</option>
              </select>
            </div>

            {/* Сортировка */}
            <div className="sort-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="created_at">По дате создания</option>
                <option value="title">По названию</option>
                <option value="status">По статусу</option>
              </select>
            </div>
          </div>

          <div className="controls-right">
            <motion.button
              className="create-task-btn"
              onClick={handleOpenCreateModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="btn-icon" />
              Создать задачу
            </motion.button>
          </div>
        </div>

        {/* Список задач */}
        <div className="tasks-content">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiCheckCircle />
              </div>
              <h3>Задач не найдено</h3>
              <p>
                {searchTerm || filterStatus !== 'all' 
                  ? 'Попробуйте изменить параметры поиска или фильтрации'
                  : 'Создайте свою первую задачу!'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <motion.button
                  className="create-first-task-btn"
                  onClick={handleOpenCreateModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus className="btn-icon" />
                  Создать первую задачу
                </motion.button>
              )}
            </div>
          ) : (
            <div className="tasks-grid">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для создания/редактирования задачи */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        title={editingTask ? 'Редактировать задачу' : 'Создать задачу'}
      />
    </div>
  );
}

export default TasksPage; 
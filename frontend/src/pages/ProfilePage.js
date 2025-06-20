import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
  });

  // Инициализация данных профиля
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [user]);

  // Загрузка статистики пользователя
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const statsData = await tasksAPI.getTaskStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Восстанавливаем исходные данные
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  };

  const handleSave = async () => {
    // В реальном приложении здесь был бы API вызов для обновления профиля
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // toast.success('Профиль обновлен успешно!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Заголовок профиля */}
          <div className="profile-header">
            <div className="profile-avatar">
              <FiUser />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user?.username || 'Пользователь'
                }
              </h1>
              <p className="profile-username">@{user?.username}</p>
              <div className="profile-meta">
                <div className="meta-item">
                  <FiCalendar className="meta-icon" />
                  <span>Дата регистрации: {user?.date_joined ? formatDate(user.date_joined) : 'Неизвестно'}</span>
                </div>
              </div>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <motion.button
                  className="edit-btn"
                  onClick={handleEdit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit2 className="btn-icon" />
                  Редактировать
                </motion.button>
              ) : (
                <div className="edit-actions">
                  <motion.button
                    className="save-btn"
                    onClick={handleSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiSave className="btn-icon" />
                    Сохранить
                  </motion.button>
                  <motion.button
                    className="cancel-btn"
                    onClick={handleCancel}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiX className="btn-icon" />
                    Отмена
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Форма профиля */}
          <div className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Личная информация</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">Имя</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`form-input ${!isEditing ? 'disabled' : ''}`}
                      placeholder="Введите имя"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Фамилия</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`form-input ${!isEditing ? 'disabled' : ''}`}
                      placeholder="Введите фамилию"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'disabled' : ''}`}
                    placeholder="Введите email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Имя пользователя</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    disabled={true} // Username обычно не редактируется
                    className="form-input disabled"
                    placeholder="Имя пользователя"
                  />
                </div>
                <small className="input-help">Имя пользователя нельзя изменить</small>
              </div>
            </div>
          </div>

          {/* Статистика пользователя */}
          {stats && (
            <div className="profile-stats">
              <h3 className="section-title">Статистика</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.total_tasks}</div>
                  <div className="stat-label">Всего задач</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.completed_tasks}</div>
                  <div className="stat-label">Выполнено</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.pending_tasks}</div>
                  <div className="stat-label">В процессе</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{Math.round(stats.completion_rate)}%</div>
                  <div className="stat-label">Процент выполнения</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage; 
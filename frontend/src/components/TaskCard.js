import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiClock, 
  FiCalendar
} from 'react-icons/fi';
import '../styles/TaskCard.css';

function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'pending':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Выполнено';
      case 'pending':
        return 'В процессе';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <motion.div
      className={`task-card ${task.status}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Статус индикатор */}
      <div 
        className="status-indicator"
        style={{ backgroundColor: getStatusColor(task.status) }}
      />

      {/* Заголовок карточки */}
      <div className="task-header">
        <div className="task-status-badge" style={{ color: getStatusColor(task.status) }}>
          {task.status === 'completed' ? <FiCheck /> : <FiClock />}
          <span>{getStatusText(task.status)}</span>
        </div>
        
        <div className="task-actions">
          <motion.button
            className="action-btn edit-btn"
            onClick={() => onEdit(task)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Редактировать"
          >
            <FiEdit2 />
          </motion.button>
          
          <motion.button
            className="action-btn delete-btn"
            onClick={() => onDelete(task.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Удалить"
          >
            <FiTrash2 />
          </motion.button>
        </div>
      </div>

      {/* Содержимое задачи */}
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        
        {task.description && (
          <p className="task-description">
            {task.description.length > 150 
              ? `${task.description.substring(0, 150)}...` 
              : task.description
            }
          </p>
        )}
      </div>

      {/* Футер карточки */}
      <div className="task-footer">
        <div className="task-meta">
          <div className="meta-item">
            <FiCalendar className="meta-icon" />
            <span className="meta-text">
              {formatDate(task.created_at)}
            </span>
          </div>
          
          {task.updated_at !== task.created_at && (
            <div className="meta-item">
              <span className="meta-label">Изменено:</span>
              <span className="meta-text">
                {formatDate(task.updated_at)}
              </span>
            </div>
          )}
        </div>

        <motion.button
          className={`toggle-status-btn ${task.status}`}
          onClick={() => onToggleStatus(task.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {task.status === 'completed' ? (
            <>
              <FiClock className="btn-icon" />
              Вернуть в работу
            </>
          ) : (
            <>
              <FiCheck className="btn-icon" />
              Завершить
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default TaskCard; 
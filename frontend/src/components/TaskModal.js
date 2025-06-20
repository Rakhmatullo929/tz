import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiFileText, FiType } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';
import '../styles/TaskModal.css';

function TaskModal({ isOpen, onClose, onSubmit, task, title }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Инициализация формы при изменении задачи
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending'
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название задачи обязательно';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Название должно содержать минимум 3 символа';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Описание не должно превышать 500 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      });
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок модального окна */}
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <motion.button
                className="modal-close-btn"
                onClick={handleClose}
                disabled={isSubmitting}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX />
              </motion.button>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body">
                {/* Название задачи */}
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    <FiType className="label-icon" />
                    Название задачи *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Введите название задачи"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    disabled={isSubmitting}
                    maxLength={255}
                  />
                  {errors.title && (
                    <span className="error-text">{errors.title}</span>
                  )}
                </div>

                {/* Описание задачи */}
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    <FiFileText className="label-icon" />
                    Описание
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Введите описание задачи (необязательно)"
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    disabled={isSubmitting}
                    rows={4}
                    maxLength={500}
                  />
                  <div className="textarea-footer">
                    {errors.description && (
                      <span className="error-text">{errors.description}</span>
                    )}
                    <span className="char-count">
                      {formData.description.length}/500
                    </span>
                  </div>
                </div>

                {/* Статус задачи (только при редактировании) */}
                {task && (
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Статус
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={isSubmitting}
                    >
                      <option value="pending">В процессе</option>
                      <option value="completed">Выполнено</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Кнопки действий */}
              <div className="modal-footer">
                <motion.button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Отмена
                </motion.button>
                
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <>
                      <FiSave className="btn-icon" />
                      {task ? 'Сохранить' : 'Создать'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskModal; 
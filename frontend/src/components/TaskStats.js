import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiClock, FiTrendingUp, FiList } from 'react-icons/fi';
import '../styles/TaskStats.css';

function TaskStats({ stats }) {
  const getCompletionColor = (rate) => {
    if (rate >= 80) return '#10b981'; // green
    if (rate >= 60) return '#f59e0b'; // amber
    if (rate >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const statCards = [
    {
      id: 'total',
      title: 'Всего задач',
      value: stats.total_tasks,
      icon: FiList,
      color: '#6366f1',
      bgColor: '#f0f9ff'
    },
    {
      id: 'completed',
      title: 'Выполнено',
      value: stats.completed_tasks,
      icon: FiCheckSquare,
      color: '#10b981',
      bgColor: '#f0fdf4'
    },
    {
      id: 'pending',
      title: 'В процессе',
      value: stats.pending_tasks,
      icon: FiClock,
      color: '#f59e0b',
      bgColor: '#fefce8'
    },
    {
      id: 'completion',
      title: 'Процент выполнения',
      value: `${Math.round(stats.completion_rate)}%`,
      icon: FiTrendingUp,
      color: getCompletionColor(stats.completion_rate),
      bgColor: '#faf5ff'
    }
  ];

  return (
    <div className="task-stats">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="stat-card"
            style={{ backgroundColor: stat.bgColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
            }}
          >
            <div className="stat-icon" style={{ color: stat.color }}>
              <stat.icon />
            </div>
            
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-title">
                {stat.title}
              </div>
            </div>

            {/* Прогресс-бар для процента выполнения */}
            {stat.id === 'completion' && (
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completion_rate}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default TaskStats; 
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiList, 
  FiUser, 
  FiLogOut, 
  FiChevronDown,
  FiCheckSquare 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Логотип и название */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <FiCheckSquare className="brand-icon" />
            <span className="brand-text">TaskManager</span>
          </Link>
        </div>

        {/* Навигационные ссылки */}
        <div className="navbar-nav">
          <Link 
            to="/tasks" 
            className={`nav-link ${isActiveLink('/') || isActiveLink('/tasks') ? 'active' : ''}`}
          >
            <FiList className="nav-icon" />
            Задачи
          </Link>
        </div>

        {/* Меню пользователя */}
        <div className="navbar-user">
          <div className="user-menu">
            <button 
              className="user-menu-trigger"
              onClick={toggleUserMenu}
              onBlur={closeUserMenu}
            >
              <div className="user-avatar">
                <FiUser />
              </div>
              <span className="user-name">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user?.username || 'Пользователь'
                }
              </span>
              <FiChevronDown 
                className={`dropdown-icon ${isUserMenuOpen ? 'rotated' : ''}`} 
              />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  className="user-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        <FiUser />
                      </div>
                      <div className="user-details">
                        <div className="user-name-large">
                          {user?.first_name && user?.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user?.username || 'Пользователь'
                          }
                        </div>
                        <div className="user-email">
                          {user?.email || 'email@example.com'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={closeUserMenu}
                    >
                      <FiUser className="dropdown-icon" />
                      Профиль
                    </Link>
                    
                    <button 
                      className="dropdown-item logout-item" 
                      onClick={handleLogout}
                    >
                      <FiLogOut className="dropdown-icon" />
                      Выйти
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 
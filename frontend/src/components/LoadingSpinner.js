import React from 'react';
import { motion } from 'framer-motion';
import '../styles/LoadingSpinner.css';

function LoadingSpinner({ size = 'medium', color = 'primary' }) {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;

  return (
    <div className={`spinner-container ${sizeClass}`}>
      <motion.div
        className={`spinner ${colorClass}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}

export default LoadingSpinner; 
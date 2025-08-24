import React, { useEffect } from 'react';
import animationStyles from './Toast.module.css';

interface ToastProps {
  message: string;
  show: boolean;
  onHide: () => void;
  duration?: number;
  type?: 'info' | 'warning' | 'success';
}

const Toast: React.FC<ToastProps> = ({
  message,
  show,
  onHide,
  duration = 3000,
  type = 'info'
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-500/90',
          text: 'text-white',
          border: 'border-amber-400/50'
        };
      case 'success':
        return {
          bg: 'bg-emerald-500/90',
          text: 'text-white',
          border: 'border-emerald-400/50'
        };
      default:
        return {
          bg: 'bg-slate-800/90',
          text: 'text-white',
          border: 'border-slate-600/50'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 ${animationStyles['animate-fade-in']}`}>
      <div 
        className={`
          ${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}
          px-6 py-3 rounded-full border backdrop-blur-sm
          shadow-lg shadow-black/20
          text-sm font-medium
          max-w-sm text-center
          transition-all duration-300 ease-out
        `}
        style={{
          animation: 'slideInFromTop 0.3s ease-out'
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default Toast;
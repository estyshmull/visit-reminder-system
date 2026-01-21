import React from 'react';
import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * כפתור צף (FAB) להוספת פעולה ראשית
 * נראה מעולה במובייל ושולחן עבודה
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = '+',
  label,
  className = '',
  disabled = false
}) => {
  const fabClasses = [
    'floating-action-button',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={fabClasses}
      onClick={onClick}
      disabled={disabled}
      title={label || 'הוסף'}
      aria-label={label || 'הוסף'}
    >
      <span className="fab-icon">{icon}</span>
      {label && (
        <span className="fab-label">{label}</span>
      )}
    </button>
  );
};

export default FloatingActionButton;
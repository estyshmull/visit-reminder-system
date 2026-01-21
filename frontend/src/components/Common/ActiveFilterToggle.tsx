import React from 'react';
import './ActiveFilterToggle.css';

interface ActiveFilterToggleProps {
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
  showActiveCount?: boolean;
  activeCount?: number;
}

/**
 * כפתור toggle לסינון מבקרים פעילים/לא פעילים
 * מציג מספר הרשומות הפעילות
 */
const ActiveFilterToggle: React.FC<ActiveFilterToggleProps> = ({
  isActive,
  onToggle,
  activeLabel = 'פעילים בלבד',
  inactiveLabel = 'הכל',
  className = '',
  showActiveCount = false,
  activeCount = 0
}) => {
  const handleToggle = () => {
    onToggle(!isActive);
  };

  const toggleClasses = [
    'active-filter-toggle',
    isActive ? 'active' : 'inactive',
    className
  ].filter(Boolean).join(' ');

  const displayLabel = isActive ? activeLabel : inactiveLabel;
  const displayCount = showActiveCount && activeCount > 0 ? ` (${activeCount})` : '';

  return (
    <button
      type="button"
      className={toggleClasses}
      onClick={handleToggle}
      title={isActive ? 'הצג את כל המבקרים' : 'הצג רק מבקרים פעילים'}
    >
      <div className="toggle-content">
        <span className="toggle-icon">
          {isActive ? '✓' : '○'}
        </span>
        
        <span className="toggle-label">
          {displayLabel}
          {displayCount && (
            <span className="toggle-count">{displayCount}</span>
          )}
        </span>
      </div>
    </button>
  );
};

export default ActiveFilterToggle;
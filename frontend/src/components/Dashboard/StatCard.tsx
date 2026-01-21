import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

/**
 * כרטיס סטטיסטיקה לחיץ עבור הדשבורד
 * מציג נתון עיקרי עם כותרת ותת-כותרת אופציונלית
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  onClick,
  className = '',
  loading = false
}) => {
  const cardClasses = [
    'stat-card',
    onClick ? 'stat-card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick && !loading) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-disabled={loading}
    >
      <div className="stat-card-content">
        <div className="stat-card-header">
          <h3 className="stat-card-title">{title}</h3>
        </div>
        
        <div className="stat-card-main">
          {loading ? (
            <div className="stat-card-loading">
              <div className="loading"></div>
            </div>
          ) : (
            <div className="stat-card-value" dir="ltr">{value}</div>
          )}
        </div>
        
        {subtitle && !loading && (
          <div className="stat-card-footer">
            <p className="stat-card-subtitle">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
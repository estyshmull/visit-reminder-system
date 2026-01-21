import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'sent' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * קומפוננטת תג סטטוס צבעוני
 * משמשת להצגת סטטוסי מבקרים, ביקורים, תזכורות וכו'
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'inactive':
        return 'לא פעיל';
      case 'pending':
        return 'ממתין';
      case 'completed':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      case 'sent':
        return 'נשלח';
      case 'failed':
        return 'נכשל';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'sent':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'inactive':
      case 'cancelled':
      case 'failed':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const badgeClasses = [
    'badge',
    getStatusClass(status),
    `badge-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;
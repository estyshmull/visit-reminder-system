import React from 'react';
import { Visitor } from '../../types';
import VisitorActivityChart from './VisitorActivityChart';
import StatusBadge from '../Common/StatusBadge';
import './VisitorCard.css';

interface VisitorCardProps {
  visitor: Visitor;
  onViewDetails?: (visitor: Visitor) => void;
  onEdit?: (visitor: Visitor) => void;
  onDelete?: (visitor: Visitor) => void;
  onScheduleVisit?: (visitor: Visitor) => void;
}

/**
 * כרטיס מבקר בודד עם כל הפרטים והפעולות
 * כולל גרף פעילות קטן ופקדי ניהול
 */
const VisitorCard: React.FC<VisitorCardProps> = ({
  visitor,
  onViewDetails,
  onEdit,
  onDelete,
  onScheduleVisit
}) => {
  const formatPhone = (phone: string) => {
    // פורמט טלפון ישראלי: 050-123-4567
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  const formatLastVisit = (date: Date | null) => {
    if (!date) return 'אף פעם';
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'היום';
    if (diffInDays === 1) return 'אתמול';
    if (diffInDays < 7) return `לפני ${diffInDays} ימים`;
    if (diffInDays < 30) return `לפני ${Math.floor(diffInDays / 7)} שבועות`;
    
    return date.toLocaleDateString('he-IL');
  };

  return (
    <div className="visitor-card card">
      <div className="visitor-card-content">
        <div className="visitor-card-header">
          <div className="visitor-main-info">
            <h3 className="visitor-name">{visitor.name}</h3>
            <StatusBadge status={visitor.status} />
          </div>
          
          <div className="visitor-contact">
            <p className="visitor-phone" dir="ltr">{formatPhone(visitor.phone)}</p>
            {visitor.email && (
              <p className="visitor-email">{visitor.email}</p>
            )}
          </div>
        </div>

        <div className="visitor-card-body">
          <div className="visitor-stats">
            <div className="stat-item">
              <span className="stat-label">ביקורים בחודש</span>
              <span className="stat-value">{visitor.visitsLastMonth}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">תדירות</span>
              <span className="stat-description">{visitor.frequency.description}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">ביקור אחרון</span>
              <span className="stat-value">{formatLastVisit(visitor.lastVisit)}</span>
            </div>
          </div>

          <div className="visitor-activity">
            <h4 className="activity-title">פעילות אחרונה</h4>
            <VisitorActivityChart data={visitor.activityData} />
          </div>
        </div>

        <div className="visitor-card-actions">
          {onViewDetails && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDetails(visitor)}
            >
              צפייה בפרטים
            </button>
          )}
          
          {onScheduleVisit && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onScheduleVisit(visitor)}
            >
              קבע ביקור
            </button>
          )}
          
          <div className="actions-right">
            {onEdit && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(visitor)}
                title="עריכת מבקר"
              >
                ✏️
              </button>
            )}
            
            {onDelete && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(visitor)}
                title="מחיקת מבקר"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorCard;
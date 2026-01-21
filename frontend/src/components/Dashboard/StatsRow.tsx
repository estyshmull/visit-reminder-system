import React from 'react';
import StatCard from './StatCard';
import './StatsRow.css';

interface StatsRowProps {
  totalVisitors: number;
  activeVisitors: number;
  upcomingVisits: number;
  pendingReminders: number;
  loading?: boolean;
  onVisitorsClick?: () => void;
  onUpcomingVisitsClick?: () => void;
  onRemindersClick?: () => void;
}

/**
 * שורת כרטיסי סטטיסטיקה עבור הדשבורד
 * מכילה 3 כרטיסים: מבקרים, ביקורים קרובים, תזכורות
 */
const StatsRow: React.FC<StatsRowProps> = ({
  totalVisitors,
  activeVisitors,
  upcomingVisits,
  pendingReminders,
  loading = false,
  onVisitorsClick,
  onUpcomingVisitsClick,
  onRemindersClick
}) => {
  return (
    <div className="stats-row">
      <StatCard
        title="סה״כ מבקרים"
        value={totalVisitors}
        subtitle={`${activeVisitors} פעילים מתוך ${totalVisitors}`}
        onClick={onVisitorsClick}
        loading={loading}
        className="fade-in"
      />
      
      <StatCard
        title="ביקורים קרובים"
        value={upcomingVisits}
        subtitle="ב-7 הימים הקרובים"
        onClick={onUpcomingVisitsClick}
        loading={loading}
        className="fade-in"
      />
      
      <StatCard
        title="תזכורות"
        value={pendingReminders}
        subtitle="תזכורות עתידיות פעילות"
        onClick={onRemindersClick}
        loading={loading}
        className="fade-in"
      />
    </div>
  );
};

export default StatsRow;
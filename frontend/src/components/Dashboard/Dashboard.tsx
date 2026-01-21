import React, { useState, useEffect } from 'react';
import StatsRow from './StatsRow';
import { apiService } from '../../services/api';
import { getMockData } from '../../data/mockData';
import { Statistics } from '../../types';
import './Dashboard.css';

/**
 * דף הדשבורד הראשי
 * מציג סטטיסטיקות כלליות ומאפשר ניווט לדפים השונים
 */
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // נסה לטעון מה-API, אם לא מצליח השתמש בנתוני mock
      const response = await apiService.getStatistics();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        // אם האAPI לא עובד, השתמש בנתונים לדוגמה
        console.warn('API not available, using mock data');
        const mockData = getMockData();
        setStats(mockData.statistics);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('שגיאה בטעינת הנתונים');
      
      // במקרה של שגיאה, השתמש בנתונים לדוגמה
      const mockData = getMockData();
      setStats(mockData.statistics);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorsClick = () => {
    // ניווט לדף המבקרים
    console.log('Navigate to visitors page');
    // TODO: הוסף ניווט עם React Router
  };

  const handleUpcomingVisitsClick = () => {
    // פתח מודל ביקורים קרובים
    console.log('Open upcoming visits modal');
    // TODO: פתח מודל עם רשימת ביקורים קרובים
  };

  const handleRemindersClick = () => {
    // פתח מודל תזכורות
    console.log('Open reminders modal');
    // TODO: פתח מודל עם רשימת תזכורות
  };

  if (error && !stats) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>שגיאה בטעינת הנתונים</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadStatistics}>
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">דשבורד ניהול ביקורים</h1>
        <p className="dashboard-subtitle">
          מבט כללי על המערכת והפעילות האחרונה
        </p>
      </div>

      <div className="dashboard-content">
        <StatsRow
          totalVisitors={stats?.totalVisitors || 0}
          activeVisitors={stats?.activeVisitors || 0}
          upcomingVisits={stats?.upcomingVisits || 0}
          pendingReminders={stats?.pendingReminders || 0}
          loading={loading}
          onVisitorsClick={handleVisitorsClick}
          onUpcomingVisitsClick={handleUpcomingVisitsClick}
          onRemindersClick={handleRemindersClick}
        />

        {/* כאן ניתן להוסיף עוד תוכן לדשבורד */}
        <div className="dashboard-recent-activity">
          <div className="card">
            <div className="card-header">
              <h3>פעילות אחרונה</h3>
            </div>
            <div className="card-content">
              <p className="text-gray-500">
                תכונה זו תתווסף בהמשך...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import { ActivityDataPoint } from '../../types';
import './VisitorActivityChart.css';

interface VisitorActivityChartProps {
  data: ActivityDataPoint[];
  maxHeight?: number;
}

/**
 * גרף פעילות קטן עבור כרטיס מבקר
 * מציג מספר ביקורים בחודשים האחרונים כגרף עמודות מיני
 */
const VisitorActivityChart: React.FC<VisitorActivityChartProps> = ({
  data,
  maxHeight = 40
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="activity-chart-empty">
        <p>אין נתוני פעילות</p>
      </div>
    );
  }

  // מציאת הערך המקסימלי לסקלה
  const maxValue = Math.max(...data.map(d => d.visits), 1);

  return (
    <div className="activity-chart">
      <div className="chart-bars">
        {data.map((point, index) => {
          const height = (point.visits / maxValue) * maxHeight;
          const monthShort = point.month.split(' ')[0].substring(0, 3); // "ינו", "פבר", וכו'
          
          return (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar"
                style={{ height: `${height}px` }}
                title={`${point.month}: ${point.visits} ביקורים`}
              >
                <div className="bar-value">{point.visits}</div>
              </div>
              <div className="chart-label">{monthShort}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisitorActivityChart;
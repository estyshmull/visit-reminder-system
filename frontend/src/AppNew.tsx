import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import AllVisitorsPage from './components/Visitors/AllVisitorsPage';
import './styles/globals.css';

// עמוד זמני עבור דפים שטרם פותחו
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
    <h2>🚧 {title}</h2>
    <p style={{ color: 'var(--text-muted)' }}>
      עמוד זה נמצא בשלבי פיתוח
    </p>
  </div>
);

/**
 * אפליקציה ראשית למערכת ניהול ביקורים
 * כולל Router, Layout מרכזי וניתוב בין הדפים
 */
function App() {
  return (
    <div className="App" dir="rtl">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/visitors" element={<AllVisitorsPage />} />
            <Route path="/calendar" element={<PlaceholderPage title="לוח שנה" />} />
            <Route path="/reports" element={<PlaceholderPage title="דוחות" />} />
            <Route path="/settings" element={<PlaceholderPage title="הגדרות" />} />
            
            {/* 404 fallback */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <h2>😕 עמוד לא נמצא</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                  העמוד שחיפשת לא קיים במערכת.
                </p>
                <a href="/dashboard" className="btn btn-primary">
                  חזור לדשבורד
                </a>
              </div>
            } />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
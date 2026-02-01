import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', label: 'דשבורד' },
    { path: '/visitors', label: 'מבקרים' },
    { path: '/calendar', label: 'לוח שנה' },
    { path: '/reminders', label: 'תזכורות' },
    { path: '/reports', label: 'דוחות' },
    { path: '/settings', label: 'הגדרות' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div>
      {/* Header */}
      <header className="header">
        <h1>מערכת תזכורות ביקורים</h1>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <ul className="nav-list">
          {navigationItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
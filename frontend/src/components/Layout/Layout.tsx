import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './LayoutNew.css';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout ראשי של האפליקציה
 * כולל Header, Sidebar עם ניווט ו-Main content
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const navItems = [
    { path: '/dashboard', label: 'דשבורד', icon: '📊' },
    { path: '/visitors', label: 'מבקרים', icon: '👥' },
    { path: '/calendar', label: 'לוח שנה', icon: '📅' },
    { path: '/reports', label: 'דוחות', icon: '📈' },
    { path: '/settings', label: 'הגדרות', icon: '⚙️' }
  ];

  return (
    <div className={`layout-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Header */}
      <header className="layout-header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'פתח תפריט' : 'סגור תפריט'}
            >
              <span className="hamburger-icon">☰</span>
            </button>
            
            <h1 className="app-title">מערכת ביקורים אצל סבתא</h1>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">שלום, מנהל</span>
              <div className="user-avatar">👤</div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="layout-sidebar">
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="layout-main">
        <div className="main-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

// אייקונים פשוטים כ-Unicode
const Icons = {
  dashboard: '📊',
  visitors: '👥',
  calendar: '📅',
  reminders: '🔔',
  reports: '📈',
  settings: '⚙️',
  home: '🏠',
  phone: '📞',
  email: '✉️',
  add: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  cancel: '❌',
  check: '✅',
  warning: '⚠️',
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  loading: '⏳',
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const navigationItems = [
    { path: '/dashboard', label: 'דשבורד', icon: Icons.dashboard },
    { path: '/visitors', label: 'מבקרים', icon: Icons.visitors },
    { path: '/calendar', label: 'לוח שנה', icon: Icons.calendar },
    { path: '/reminders', label: 'תזכורות', icon: Icons.reminders },
    { path: '/reports', label: 'דוחות', icon: Icons.reports },
    { path: '/settings', label: 'הגדרות', icon: Icons.settings },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>
          {Icons.home} מערכת ביקורים אצל סבתא
        </h1>
        <p className="header-subtitle">
          ניהול ותיאום ביקורים עם תזכורות אוטומטיות
        </p>
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
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: 'var(--spacing-lg)', 
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-primary)'
      }}>
        <p>מערכת ביקורים אצל סבתא © {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default Layout
export { Icons }
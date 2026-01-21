import React, { useState, useEffect } from 'react'
import { Card, LoadingSpinner, Alert, Badge } from '../components/UI'
import { Icons } from '../components/Layout'
import api, { Visitor, Visit, Reminder } from '../services/newApi'

// Mock data for development
const mockDashboardData = {
  stats: {
    totalVisitors: 12,
    activeVisitors: 8,
    upcomingVisits: 3,
    pendingReminders: 2,
  },
  upcomingVisits: [
    {
      id: '1',
      userId: 'user1',
      scheduledAt: '2026-01-20T10:00:00Z',
      status: 'SCHEDULED' as const,
      visitor: {
        id: 'v1',
        name: 'מרים כהן',
        phone: '050-1234567',
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: '2',
      userId: 'user2',
      scheduledAt: '2026-01-21T14:30:00Z',
      status: 'CONFIRMED' as const,
      visitor: {
        id: 'v2',
        name: 'דוד לוי',
        phone: '052-7654321',
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ],
  recentReminders: [
    {
      id: 'r1',
      userId: 'user1',
      scheduledDate: '2026-01-19T09:00:00Z',
      status: 'SENT' as const,
      sentAt: '2026-01-19T09:00:00Z',
      visitor: {
        id: 'v1',
        name: 'מרים כהן',
        phone: '050-1234567',
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      createdAt: '2026-01-19T08:55:00Z',
    }
  ]
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState(mockDashboardData.stats)
  const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([])
  const [recentReminders, setRecentReminders] = useState<Reminder[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // In development, use mock data
      // In production, these calls will work with your API
      if (import.meta.env.MODE === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setUpcomingVisits(mockDashboardData.upcomingVisits)
        setRecentReminders(mockDashboardData.recentReminders)
      } else {
        // Real API calls
        const [visitsData, remindersData] = await Promise.all([
          api.visits.getUpcoming(),
          api.reminders.getPending(),
        ])
        
        setUpcomingVisits(visitsData)
        setRecentReminders(remindersData)
        
        // Calculate stats from real data
        const visitorsData = await api.visitors.getAll()
        setStats({
          totalVisitors: visitorsData.length,
          activeVisitors: visitorsData.filter(v => v.isActive).length,
          upcomingVisits: visitsData.length,
          pendingReminders: remindersData.length,
        })
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת הנתונים')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('he-IL'),
      time: date.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      SCHEDULED: { variant: 'info' as const, text: 'מתוזמן' },
      CONFIRMED: { variant: 'success' as const, text: 'מאושר' },
      COMPLETED: { variant: 'success' as const, text: 'הושלם' },
      CANCELLED: { variant: 'error' as const, text: 'בוטל' },
      PENDING: { variant: 'warning' as const, text: 'ממתין' },
      SENT: { variant: 'success' as const, text: 'נשלח' },
      FAILED: { variant: 'error' as const, text: 'נכשל' },
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { variant: 'info' as const, text: status }
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.text}
      </Badge>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '2rem', color: 'var(--text-primary)' }}>
        {Icons.dashboard} דשבורד
      </h2>

      {error && (
        <Alert 
          type="error" 
          message={error}
          onClose={() => setError(null)} 
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <Card 
          title={stats.totalVisitors.toString()}
          subtitle="סה״כ מבקרים"
        >
          <div style={{ fontSize: '3rem', textAlign: 'center' }}>
            {Icons.visitors}
          </div>
        </Card>

        <Card 
          title={stats.activeVisitors.toString()}
          subtitle="מבקרים פעילים"
        >
          <div style={{ fontSize: '3rem', textAlign: 'center' }}>
            {Icons.check}
          </div>
        </Card>

        <Card 
          title={stats.upcomingVisits.toString()}
          subtitle="ביקורים קרובים"
        >
          <div style={{ fontSize: '3rem', textAlign: 'center' }}>
            {Icons.calendar}
          </div>
        </Card>

        <Card 
          title={stats.pendingReminders.toString()}
          subtitle="תזכורות ממתינות"
        >
          <div style={{ fontSize: '3rem', textAlign: 'center' }}>
            {Icons.reminders}
          </div>
        </Card>
      </div>

      <div className="grid grid-2">
        {/* Upcoming Visits */}
        <Card title="ביקורים קרובים">
          {upcomingVisits.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
              אין ביקורים מתוזמנים בזמן הקרוב
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {upcomingVisits.map((visit) => {
                const { date, time } = formatDateTime(visit.scheduledAt)
                
                return (
                  <div 
                    key={visit.id}
                    style={{
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                        {visit.visitor.name}
                      </h4>
                      {getStatusBadge(visit.status)}
                    </div>
                    
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        {Icons.calendar} {date} בשעה {time}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
                        {Icons.phone} {visit.visitor.phone}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent Reminders */}
        <Card title="תזכורות אחרונות">
          {recentReminders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
              אין תזכורות לאחרונה
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {recentReminders.map((reminder) => {
                const { date, time } = formatDateTime(reminder.createdAt)
                
                return (
                  <div 
                    key={reminder.id}
                    style={{
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 'var(--spacing-sm)'
                    }}>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                        {reminder.visitor.name}
                      </h4>
                      {getStatusBadge(reminder.status)}
                    </div>
                    
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        {Icons.calendar} {date} בשעה {time}
                      </div>
                      {reminder.sentAt && (
                        <div style={{ color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                          {Icons.check} נשלח בהצלחה
                        </div>
                      )}
                      {reminder.errorMessage && (
                        <div style={{ color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                          {Icons.error} {reminder.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card 
        title="פעולות מהירות" 
        style={{ marginTop: 'var(--spacing-xl)' }}
      >
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <a href="/visitors" className="btn btn-primary btn-large">
            {Icons.add} הוסף מבקר חדש
          </a>
          <a href="/calendar" className="btn btn-secondary btn-large">
            {Icons.calendar} תזמן ביקור
          </a>
          <a href="/reminders" className="btn btn-outline btn-large">
            {Icons.reminders} נהל תזכורות
          </a>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard

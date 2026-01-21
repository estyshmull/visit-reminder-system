import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Textarea, Modal, Table, LoadingSpinner, Alert, Badge } from '../components/UI'
import { Icons } from '../components/Layout'
import api, { Visitor, CreateVisitorRequest } from '../services/newApi'

// Mock data for development
const mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'מרים כהן',
    phone: '050-1234567',
    email: 'miriam@example.com',
    address: 'רחוב הגפן 5, ירושלים',
    notes: 'מבקרת קבועה, אוהבת תה עם עוגיות',
    isActive: true,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'דוד לוי',
    phone: '052-7654321',
    email: 'david@example.com',
    address: 'רחוב השלום 12, תל אביב',
    notes: 'בן משפחה, מבקר בסוף השבוע',
    isActive: true,
    createdAt: '2026-01-02T14:00:00Z',
    updatedAt: '2026-01-02T14:00:00Z',
  },
  {
    id: '3',
    name: 'שרה אברהם',
    phone: '053-9876543',
    email: '',
    address: 'רחוב המלך דוד 8, חיפה',
    notes: 'שכנה חמה, מביאה פרחים',
    isActive: false,
    createdAt: '2026-01-03T16:00:00Z',
    updatedAt: '2026-01-03T16:00:00Z',
  },
]

const Visitors: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateVisitorRequest>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadVisitors()
  }, [])

  const loadVisitors = async () => {
    setLoading(true)
    setError(null)

    try {
      if (import.meta.env.MODE === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        setVisitors(mockVisitors)
      } else {
        const data = await api.visitors.getAll()
        setVisitors(data)
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת המבקרים')
      console.error('Visitors loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (visitor?: Visitor) => {
    if (visitor) {
      setEditingVisitor(visitor)
      setFormData({
        name: visitor.name,
        phone: visitor.phone,
        email: visitor.email || '',
        address: visitor.address || '',
        notes: visitor.notes || '',
      })
    } else {
      setEditingVisitor(null)
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      })
    }
    setFormErrors({})
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingVisitor(null)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'שם המבקר הוא שדה חובה'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'מספר טלפון הוא שדה חובה'
    } else if (!/^0\d{1,2}-?\d{7}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'מספר טלפון לא תקין (לדוגמה: 050-1234567)'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'כתובת מייל לא תקינה'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (editingVisitor) {
        if (import.meta.env.MODE === 'development') {
          // Mock update
          await new Promise(resolve => setTimeout(resolve, 500))
          const updatedVisitor = { ...editingVisitor, ...formData, updatedAt: new Date().toISOString() }
          setVisitors(prev => prev.map(v => v.id === editingVisitor.id ? updatedVisitor : v))
        } else {
          const updatedVisitor = await api.visitors.update(editingVisitor.id, formData)
          setVisitors(prev => prev.map(v => v.id === editingVisitor.id ? updatedVisitor : v))
        }
      } else {
        if (import.meta.env.MODE === 'development') {
          // Mock create
          await new Promise(resolve => setTimeout(resolve, 500))
          const newVisitor: Visitor = {
            ...formData,
            id: Date.now().toString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          setVisitors(prev => [newVisitor, ...prev])
        } else {
          const newVisitor = await api.visitors.create(formData)
          setVisitors(prev => [newVisitor, ...prev])
        }
      }

      closeModal()
    } catch (err: any) {
      setFormErrors({ general: err.message || 'שגיאה בשמירת המבקר' })
      console.error('Submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (visitor: Visitor) => {
    try {
      if (import.meta.env.MODE === 'development') {
        // Mock toggle
        const updatedVisitor = { ...visitor, isActive: !visitor.isActive }
        setVisitors(prev => prev.map(v => v.id === visitor.id ? updatedVisitor : v))
      } else {
        if (!visitor.isActive) {
          const updatedVisitor = await api.visitors.activate(visitor.id)
          setVisitors(prev => prev.map(v => v.id === visitor.id ? updatedVisitor : v))
        } else {
          await api.visitors.delete(visitor.id)
          setVisitors(prev => prev.map(v => 
            v.id === visitor.id ? { ...v, isActive: false } : v
          ))
        }
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בעדכון סטטוס המבקר')
    }
  }

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.phone.includes(searchTerm)
    const matchesStatus = showInactive || visitor.isActive
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL')
  }

  const tableColumns = [
    {
      key: 'name',
      title: 'שם',
      render: (value: string, visitor: Visitor) => (
        <div>
          <strong>{value}</strong>
          {!visitor.isActive && (
            <Badge variant="error" style={{ marginRight: 'var(--spacing-xs)' }}>
              לא פעיל
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'טלפון',
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          {Icons.phone} {value}
        </div>
      ),
    },
    {
      key: 'email',
      title: 'מייל',
      render: (value: string) => value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          {Icons.email} {value}
        </div>
      ) : '-',
    },
    {
      key: 'createdAt',
      title: 'תאריך הוספה',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      title: 'פעולות',
      render: (_: any, visitor: Visitor) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <Button
            size="small"
            variant="outline"
            onClick={() => openModal(visitor)}
          >
            {Icons.edit} ערוך
          </Button>
          <Button
            size="small"
            variant={visitor.isActive ? 'outline' : 'secondary'}
            onClick={() => handleToggleActive(visitor)}
          >
            {visitor.isActive ? `${Icons.delete} השבת` : `${Icons.check} הפעל`}
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>
          {Icons.visitors} ניהול מבקרים
        </h2>
        <Button variant="primary" onClick={() => openModal()}>
          {Icons.add} הוסף מבקר חדש
        </Button>
      </div>

      {error && (
        <Alert 
          type="error" 
          message={error}
          onClose={() => setError(null)} 
        />
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Input
            label="חיפוש מבקר"
            placeholder="חפש לפי שם או טלפון..."
            value={searchTerm}
            onChange={setSearchTerm}
            style={{ minWidth: '250px' }}
          />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontSize: '1rem' }}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            הצג גם מבקרים לא פעילים
          </label>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {filteredVisitors.length} מבקרים מוצגים מתוך {visitors.length}
          </div>
        </div>
      </Card>

      {/* Visitors Table */}
      <Table
        columns={tableColumns}
        data={filteredVisitors}
        loading={loading}
        emptyMessage={searchTerm ? 'לא נמצאו מבקרים התואמים לחיפוש' : 'אין מבקרים במערכת'}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingVisitor ? 'עריכת מבקר' : 'הוספת מבקר חדש'}
        size="medium"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
              {Icons.cancel} בטל
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {Icons.save} {editingVisitor ? 'שמור שינויים' : 'הוסף מבקר'}
            </Button>
          </>
        }
      >
        {formErrors.general && (
          <Alert type="error" message={formErrors.general} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <Input
            label="שם המבקר"
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="הכנס שם מלא"
            required
            error={formErrors.name}
            disabled={isSubmitting}
          />

          <Input
            label="מספר טלפון"
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
            placeholder="050-1234567"
            required
            error={formErrors.phone}
            disabled={isSubmitting}
          />

          <Input
            label="כתובת מייל"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            placeholder="example@gmail.com"
            error={formErrors.email}
            disabled={isSubmitting}
          />

          <Input
            label="כתובת"
            value={formData.address}
            onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
            placeholder="רחוב, עיר"
            disabled={isSubmitting}
          />

          <Textarea
            label="הערות"
            value={formData.notes}
            onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
            placeholder="הערות נוספות על המבקר..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </Modal>
    </div>
  )
}

export default Visitors
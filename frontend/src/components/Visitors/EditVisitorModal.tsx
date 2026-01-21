import React, { useState, useEffect } from 'react';
import { Visitor } from '../../types';
import Modal from '../Common/Modal';
import './EditVisitorModal.css';

interface EditVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitor: Visitor) => void;
  visitor?: Visitor;
  title: string;
}

/**
 * מודל לעריכת/הוספת מבקר
 * כולל validation ומצבי טעינה
 */
const EditVisitorModal: React.FC<EditVisitorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  visitor,
  title
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    notes: '',
    isActive: true
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visitor) {
      setFormData({
        name: visitor.name,
        phone: visitor.phone,
        email: visitor.email || '',
        relationship: visitor.relationship,
        notes: visitor.notes || '',
        isActive: visitor.isActive
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        notes: '',
        isActive: true
      });
    }
    setErrors({});
  }, [visitor, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם המבקר נדרש';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'מספר טלפון נדרש';
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = 'מספר טלפון לא תקין';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = 'קשר משפחתי נדרש';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const updatedVisitor: Visitor = {
        id: visitor?.id || Date.now().toString(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        relationship: formData.relationship.trim(),
        notes: formData.notes.trim() || undefined,
        isActive: formData.isActive,
        createdAt: visitor?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(updatedVisitor);
      onClose();
    } catch (error) {
      console.error('Error saving visitor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // נקה שגיאה כאשר משתמש מתחיל להקליד
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="500px"
      className="edit-visitor-modal"
    >
      <form onSubmit={handleSubmit} className="visitor-form">
        <div className="form-group">
          <label htmlFor="visitor-name" className="form-label">
            שם המבקר *
          </label>
          <input
            id="visitor-name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="הכנס שם מלא"
            disabled={loading}
            autoFocus
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="visitor-phone" className="form-label">
            מספר טלפון *
          </label>
          <input
            id="visitor-phone"
            type="tel"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="052-123-4567"
            disabled={loading}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="visitor-email" className="form-label">
            אימייל (אופציונלי)
          </label>
          <input
            id="visitor-email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="example@gmail.com"
            disabled={loading}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="visitor-relationship" className="form-label">
            קשר משפחתי *
          </label>
          <select
            id="visitor-relationship"
            className={`form-input ${errors.relationship ? 'error' : ''}`}
            value={formData.relationship}
            onChange={(e) => handleChange('relationship', e.target.value)}
            disabled={loading}
          >
            <option value="">בחר קשר משפחתי</option>
            <option value="בן">בן</option>
            <option value="בת">בת</option>
            <option value="נכד">נכד</option>
            <option value="נכדה">נכדה</option>
            <option value="אח">אח</option>
            <option value="אחות">אחות</option>
            <option value="חבר">חבר</option>
            <option value="חברה">חברה</option>
            <option value="שכן">שכן</option>
            <option value="אחר">אחר</option>
          </select>
          {errors.relationship && <span className="error-message">{errors.relationship}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="visitor-notes" className="form-label">
            הערות (אופציונלי)
          </label>
          <textarea
            id="visitor-notes"
            className="form-input textarea"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="הערות נוספות על המבקר..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-text">מבקר פעיל</span>
          </label>
          <small className="help-text">
            מבקרים לא פעילים לא יקבלו תזכורות חדשות
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            ביטול
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '...' : visitor ? 'עדכן מבקר' : 'הוסף מבקר'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditVisitorModal;
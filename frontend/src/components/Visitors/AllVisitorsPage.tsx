import React, { useState, useEffect } from 'react';
import { Visitor, VisitorFilters } from '../../types';
import { apiService } from '../../services/api';
import { getMockData } from '../../data/mockData';
import VisitorCard from './VisitorCard';
import SearchBar from '@/components/Common/SearchBar';
import ActiveFilterToggle from '../Common/ActiveFilterToggle';
import EditVisitorModal from './EditVisitorModal';
import Modal from '../Common/Modal';
import './AllVisitorsPage.css';

/**
 * דף כל המבקרים - המרכזי וחשוב!
 * כולל חיפוש, סינון, רשימת מבקרים עם פעולות
 */
const AllVisitorsPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VisitorFilters>({
    status: 'all',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Modal states
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    visitor?: Visitor;
  }>({ isOpen: false });
  
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    visitor?: Visitor;
  }>({ isOpen: false });

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [visitors, filters]);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      setError(null);

      // נסה לטעון מה-API, אם לא מצליח השתמש בנתוני mock
      const response = await apiService.getVisitors();
      
      if (response.success && response.data) {
        setVisitors(response.data);
      } else {
        // אם האAPI לא עובד, השתמש בנתונים לדוגמה
        console.warn('API not available, using mock data');
        const mockData = getMockData();
        setVisitors(mockData.visitors);
      }
    } catch (err) {
      console.error('Error loading visitors:', err);
      setError('שגיאה בטעינת רשימת המבקרים');
      
      // במקרה של שגיאה, השתמש בנתונים לדוגמה
      const mockData = getMockData();
      setVisitors(mockData.visitors);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visitors];

    // סינון לפי סטטוס
    if (filters.status !== 'all') {
      filtered = filtered.filter(visitor => visitor.status === filters.status);
    }

    // חיפוש לפי שם או טלפון
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(visitor =>
        visitor.name.toLowerCase().includes(searchLower) ||
        visitor.phone.includes(filters.search!) ||
        (visitor.email && visitor.email.toLowerCase().includes(searchLower))
      );
    }

    // מיון
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'lastVisit':
          aValue = a.lastVisit ? a.lastVisit.getTime() : 0;
          bValue = b.lastVisit ? b.lastVisit.getTime() : 0;
          break;
        case 'visitsCount':
          aValue = a.visitsLastMonth;
          bValue = b.visitsLastMonth;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredVisitors(filtered);
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  const handleActiveToggle = (showActiveOnly: boolean) => {
    setFilters(prev => ({
      ...prev,
      status: showActiveOnly ? 'active' : 'all'
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDetails = (visitor: Visitor) => {
    console.log('View details for:', visitor.name);
    // TODO: פתח מודל עם פרטי מבקר מלאים
  };

  const handleEdit = (visitor: Visitor) => {
    handleEditVisitor(visitor);
  };

  const handleDelete = (visitor: Visitor) => {
    handleDeleteVisitor(visitor);
  };

  const handleScheduleVisit = (visitor: Visitor) => {
    console.log('Schedule visit for:', visitor.name);
    // TODO: פתח מודל קביעת ביקור
  };

  const handleAddVisitor = () => {
    handleEditVisitor();
  };

  // Modal handlers
  const handleEditVisitor = (visitor?: Visitor) => {
    setEditModal({ isOpen: true, visitor });
  };

  const handleDeleteVisitor = (visitor: Visitor) => {
    setDeleteModal({ isOpen: true, visitor });
  };

  const handleSaveVisitor = async (visitor: Visitor) => {
    try {
      if (editModal.visitor) {
        // עדכון מבקר קיים
        const response = await apiService.updateVisitor(visitor.id, visitor);
        if (response.success && response.data) {
          setVisitors(prev => prev.map(v => v.id === visitor.id ? response.data! : v));
        }
      } else {
        // הוספת מבקר חדש
        const response = await apiService.createVisitor(visitor);
        if (response.success && response.data) {
          setVisitors(prev => [response.data!, ...prev]);
        }
      }
      setEditModal({ isOpen: false });
    } catch (error) {
      console.error('Error saving visitor:', error);
      // TODO: הצג הודעת שגיאה למשתמש
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.visitor) return;

    try {
      await apiService.deleteVisitor(deleteModal.visitor.id);
      setVisitors(prev => prev.filter(v => v.id !== deleteModal.visitor!.id));
      setDeleteModal({ isOpen: false });
    } catch (error) {
      console.error('Error deleting visitor:', error);
      // TODO: הצג הודעת שגיאה למשתמש
    }
  };

  if (loading) {
    return (
      <div className="visitors-page-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>טוען רשימת מבקרים...</p>
        </div>
      </div>
    );
  }

  if (error && visitors.length === 0) {
    return (
      <div className="visitors-page-container">
        <div className="error-container">
          <h2>שגיאה בטעינת הנתונים</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadVisitors}>
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="visitors-page-container">
      <div className="visitors-page-header">
        <div className="header-top">
          <h1 className="page-title">כל המבקרים</h1>
          <button className="btn btn-primary btn-lg" onClick={handleAddVisitor}>
            הוסף מבקר חדש
          </button>
        </div>
        
        <div className="filters-row">
          <div className="search-section">
            <SearchBar 
              placeholder="חיפוש לפי שם או טלפון..."
              onSearch={handleSearch}
              value={filters.search || ''}
            />
          </div>
          
          <div className="filter-controls">
            <ActiveFilterToggle 
              isActive={filters.status === 'active'}
              onToggle={handleActiveToggle}
            />
            
            <div className="sort-controls">
              <label htmlFor="sort-select">מיון לפי:</label>
              <select 
                id="sort-select"
                className="form-input"
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="name">שם (א-ת)</option>
                <option value="lastVisit">תאריך ביקור אחרון</option>
                <option value="visitsCount">מספר ביקורים</option>
              </select>
            </div>
          </div>
        </div>

        <div className="results-summary">
          <p>
            מציג <strong>{filteredVisitors.length}</strong> מבקרים מתוך{' '}
            <strong>{visitors.length}</strong>
            {filters.status === 'active' && ' (פעילים בלבד)'}
          </p>
        </div>
      </div>

      <div className="visitors-grid">
        {filteredVisitors.length === 0 ? (
          <div className="empty-state">
            <h3>לא נמצאו מבקרים</h3>
            <p>
              {filters.search || filters.status !== 'all'
                ? 'נסה לשנות את קריטריוני החיפוש'
                : 'לא קיימים מבקרים במערכת'}
            </p>
            {!filters.search && filters.status === 'all' && (
              <button className="btn btn-primary" onClick={handleAddVisitor}>
                הוסף מבקר ראשון
              </button>
            )}
          </div>
        ) : (
          filteredVisitors.map((visitor) => (
            <VisitorCard
              key={visitor.id}
              visitor={visitor}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onScheduleVisit={handleScheduleVisit}
            />
          ))
        )}
      </div>

      {/* Edit/Add Visitor Modal */}
      <EditVisitorModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        onSave={handleSaveVisitor}
        visitor={editModal.visitor}
        title={editModal.visitor ? 'עריכת מבקר' : 'הוספת מבקר חדש'}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title="מחיקת מבקר"
        maxWidth="400px"
        className="compact"
      >
        <div style={{ textAlign: 'center', padding: 'var(--spacing-md) 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
            🗑️
          </div>
          <h3 style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--text-color)' }}>
            האם אתה בטוח?
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
            פעולה זו תמחק את המבקר <strong>{deleteModal.visitor?.name}</strong> לצמיתות.
            <br />
            לא ניתן לבטל פעולה זו.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)', 
            justifyContent: 'center' 
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDeleteModal({ isOpen: false })}
            >
              ביטול
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleConfirmDelete}
              style={{
                backgroundColor: 'var(--error-color)',
                color: 'white'
              }}
            >
              מחק מבקר
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllVisitorsPage;
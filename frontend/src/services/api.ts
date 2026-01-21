// שירות API לתקשורת עם הבקאנד
import { 
  Visitor, 
  Visit, 
  Reminder, 
  Statistics, 
  ApiResponse, 
  VisitorFilters, 
  CalendarFilters 
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // קבלת הטוכן מה-localStorage (אם קיים)
      const token = localStorage.getItem('authToken');
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API Error - ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // אימות
  async login(username: string, password: string) {
    return this.request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // סטטיסטיקות
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    // מכיון שאין endpoint ספציפי לסטטיסטיקות, נחשב אותן מהנתונים הקיימים
    const [visitorsRes, visitsRes, remindersRes] = await Promise.all([
      this.getVisitors({ status: 'all' }),
      this.getUpcomingVisits(7), // ביקורים ב-7 ימים הקרובים
      this.getReminders()
    ]);

    if (visitorsRes.success && visitsRes.success && remindersRes.success) {
      const visitors = visitorsRes.data || [];
      const visits = visitsRes.data || [];
      const reminders = remindersRes.data || [];

      const stats: Statistics = {
        totalVisitors: visitors.length,
        activeVisitors: visitors.filter(v => v.status === 'active').length,
        upcomingVisits: visits.length,
        pendingReminders: reminders.filter(r => r.status === 'pending').length,
      };

      return { success: true, data: stats };
    }

    return { success: false, error: 'Failed to fetch statistics' };
  }

  // מבקרים
  async getVisitors(filters: VisitorFilters = {}): Promise<ApiResponse<Visitor[]>> {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    return this.request<Visitor[]>(`/visitors${queryString ? `?${queryString}` : ''}`);
  }

  async getVisitor(id: string): Promise<ApiResponse<Visitor>> {
    return this.request<Visitor>(`/visitors/${id}`);
  }

  async createVisitor(visitor: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Visitor>> {
    return this.request<Visitor>('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitor),
    });
  }

  async updateVisitor(id: string, visitor: Partial<Visitor>): Promise<ApiResponse<Visitor>> {
    return this.request<Visitor>(`/visitors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(visitor),
    });
  }

  async deleteVisitor(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/visitors/${id}`, {
      method: 'DELETE',
    });
  }

  // ביקורים
  async getVisits(): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>('/schedules/visits');
  }

  async getUpcomingVisits(days: number = 7): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>(`/schedules/visits/upcoming?days=${days}`);
  }

  async getVisitsByDate(filters: CalendarFilters): Promise<ApiResponse<Visit[]>> {
    return this.request<Visit[]>(`/schedules/visits/by-date?year=${filters.year}&month=${filters.month}`);
  }

  async getVisit(id: string): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/schedules/visits/${id}`);
  }

  async createVisit(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Visit>> {
    return this.request<Visit>('/schedules', {
      method: 'POST',
      body: JSON.stringify(visit),
    });
  }

  async updateVisit(id: string, visit: Partial<Visit>): Promise<ApiResponse<Visit>> {
    return this.request<Visit>(`/schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(visit),
    });
  }

  async deleteVisit(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // תזכורות
  async getReminders(): Promise<ApiResponse<Reminder[]>> {
    return this.request<Reminder[]>('/reminders');
  }

  async getPendingReminders(): Promise<ApiResponse<Reminder[]>> {
    return this.request<Reminder[]>('/reminders/pending');
  }

  async createReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<ApiResponse<Reminder>> {
    return this.request<Reminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    });
  }

  async updateReminder(id: string, reminder: Partial<Reminder>): Promise<ApiResponse<Reminder>> {
    return this.request<Reminder>(`/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(reminder),
    });
  }

  async deleteReminder(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  async sendReminder(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/reminders/${id}/send`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();

// טיפוסי נתונים עבור מערכת ניהול הביקורים

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  lastVisit: Date | null;
  visitsLastMonth: number;
  frequency: {
    type: 'weekly' | 'biweekly' | 'monthly' | 'irregular' | 'none';
    description: string;
  };
  activityData: ActivityDataPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDataPoint {
  month: string;
  visits: number;
}

export interface Visit {
  id: string;
  visitorId: string;
  visitor?: Visitor;
  scheduledAt: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  visitorId: string;
  visitor?: Visitor;
  scheduledDate: Date;
  type: 'sms' | 'email' | 'whatsapp' | 'voice';
  status: 'pending' | 'sent' | 'failed';
  message?: string;
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface Statistics {
  totalVisitors: number;
  activeVisitors: number;
  upcomingVisits: number;
  pendingReminders: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// טיפוסים לפילטרים וחיפוש
export interface VisitorFilters {
  status?: 'all' | 'active' | 'inactive';
  search?: string;
  sortBy?: 'name' | 'lastVisit' | 'visitsCount' | 'frequency';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CalendarFilters {
  year: number;
  month: number;
}

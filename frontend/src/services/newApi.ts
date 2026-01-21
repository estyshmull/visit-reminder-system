import axios, { AxiosResponse, AxiosError } from 'axios'

// הגדרת BaseURL
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api'

// יצירת instance של axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// ===== Types ===== //

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    username: string
    fullName: string
  }
}

export interface Visitor {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVisitorRequest {
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
}

export interface Visit {
  id: string
  userId: string
  scheduledAt: string
  duration?: number
  notes?: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  visitor: Visitor
  createdAt: string
  updatedAt: string
}

export interface CreateVisitRequest {
  userId: string
  scheduledAt: string
  duration?: number
  notes?: string
}

export interface Reminder {
  id: string
  userId: string
  scheduledDate: string
  status: 'PENDING' | 'SENT' | 'FAILED'
  sentAt?: string
  errorMessage?: string
  visitor: Visitor
  createdAt: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// ===== Auth Management ===== //

let authToken: string | null = localStorage.getItem('auth_token')

export const setAuthToken = (token: string) => {
  authToken = token
  localStorage.setItem('auth_token', token)
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const clearAuthToken = () => {
  authToken = null
  localStorage.removeItem('auth_token')
  delete apiClient.defaults.headers.common['Authorization']
}

export const getAuthToken = () => authToken

// הוספת interceptor לכל בקשה
apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// טיפול בשגיאות
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      clearAuthToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ===== Helper Functions ===== //

const handleApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'שגיאה לא ידועה',
      statusCode: error.response.status,
      error: error.response.data.error,
    }
  }
  
  if (error.request) {
    return {
      message: 'אין חיבור לשרת. אנא בדוק את החיבור לאינטרנט.',
      statusCode: 0,
    }
  }
  
  return {
    message: error.message || 'שגיאה לא ידועה',
    statusCode: 0,
  }
}

// ===== API Functions ===== //

// Authentication
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post('/auth/login', credentials)
      const { access_token } = response.data
      setAuthToken(access_token)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  logout: () => {
    clearAuthToken()
  },
}

// Visitors API
export const visitorsApi = {
  // קבלת כל המבקרים
  getAll: async (): Promise<Visitor[]> => {
    try {
      const response: AxiosResponse<Visitor[]> = await apiClient.get('/visitors')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // קבלת מבקר לפי ID
  getById: async (id: string): Promise<Visitor> => {
    try {
      const response: AxiosResponse<Visitor> = await apiClient.get(`/visitors/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // יצירת מבקר חדש
  create: async (visitor: CreateVisitorRequest): Promise<Visitor> => {
    try {
      const response: AxiosResponse<Visitor> = await apiClient.post('/visitors', visitor)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // עדכון מבקר
  update: async (id: string, visitor: Partial<CreateVisitorRequest>): Promise<Visitor> => {
    try {
      const response: AxiosResponse<Visitor> = await apiClient.patch(`/visitors/${id}`, visitor)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // מחיקה רכה
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/visitors/${id}`)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // הפעלת מבקר
  activate: async (id: string): Promise<Visitor> => {
    try {
      const response: AxiosResponse<Visitor> = await apiClient.patch(`/visitors/${id}/activate`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Visits API (Schedules)
export const visitsApi = {
  // קבלת כל הביקורים
  getAll: async (): Promise<Visit[]> => {
    try {
      const response: AxiosResponse<Visit[]> = await apiClient.get('/schedules/visits')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // קבלת ביקורים קרובים
  getUpcoming: async (): Promise<Visit[]> => {
    try {
      const response: AxiosResponse<Visit[]> = await apiClient.get('/schedules/visits/upcoming')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // קבלת ביקורים לפי תאריך
  getByDate: async (date: string): Promise<Visit[]> => {
    try {
      const response: AxiosResponse<Visit[]> = await apiClient.get('/schedules/visits/by-date', {
        params: { date }
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // יצירת ביקור חדש
  create: async (visit: CreateVisitRequest): Promise<Visit> => {
    try {
      const response: AxiosResponse<Visit> = await apiClient.post('/schedules', visit)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // קבלת ביקור לפי ID
  getById: async (id: string): Promise<Visit> => {
    try {
      const response: AxiosResponse<Visit> = await apiClient.get(`/schedules/visits/${id}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // בדיקת זמינות
  checkAvailability: async (date: string, duration: number = 60): Promise<{ available: boolean }> => {
    try {
      const response: AxiosResponse<{ available: boolean }> = await apiClient.get('/schedules/check-availability', {
        params: { date, duration }
      })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Reminders API
export const remindersApi = {
  // קבלת כל התזכורות
  getAll: async (): Promise<Reminder[]> => {
    try {
      const response: AxiosResponse<Reminder[]> = await apiClient.get('/reminders')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // קבלת תזכורות ממתינות
  getPending: async (): Promise<Reminder[]> => {
    try {
      const response: AxiosResponse<Reminder[]> = await apiClient.get('/reminders/pending')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // שליחת תזכורת ידנית
  send: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/reminders/${id}/send`)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // בדיקת חיבור לימות המשיח
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.get('/reminders/yemot/test')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Reports API
export const reportsApi = {
  // קבלת סקירה כללית
  getOverview: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/reports/overview')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // דוח חודשי
  getMonthly: async (year?: number, month?: number): Promise<any> => {
    try {
      const params: any = {}
      if (year) params.year = year
      if (month) params.month = month
      
      const response = await apiClient.get('/reports/monthly', { params })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // דוח מבקרים
  getVisitors: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/reports/visitors')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Health Check
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Export everything
export default {
  auth: authApi,
  visitors: visitorsApi,
  visits: visitsApi,
  reminders: remindersApi,
  reports: reportsApi,
  health: healthApi,
}
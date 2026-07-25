import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests (SSR-safe)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle 401/403 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string; phone?: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
}

// Business API
export const businessAPI = {
  create: (data: any) => api.post('/api/business/', data),
  getAll: () => api.get('/api/business/'),
  getById: (id: number) => api.get(`/api/business/${id}`),
  update: (id: number, data: any) => api.put(`/api/business/${id}`, data),
}

// Chat API
export const chatAPI = {
  createChat: (data: any) => api.post('/api/chats', data),
  getChats: (businessId: number) => api.get(`/api/chats?business_id=${businessId}`),
  sendMessage: (chatId: number, data: any) => api.post(`/api/chats/${chatId}/messages`, data),
  getMessages: (chatId: number) => api.get(`/api/chats/${chatId}/messages`),
}

// Products API
export const productsAPI = {
  create: (data: any) => api.post('/api/products/', data),
  getAll: (businessId: number, skip = 0, limit = 100) =>
    api.get(`/api/products/?business_id=${businessId}&skip=${skip}&limit=${limit}`),
  getById: (id: number) => api.get(`/api/products/${id}`),
  update: (id: number, data: any) => api.put(`/api/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/products/${id}`),
}

// Orders API
export const ordersAPI = {
  create: (data: any) => api.post('/api/orders/', data),
  getAll: (businessId: number, skip = 0, limit = 100) =>
    api.get(`/api/orders/?business_id=${businessId}&skip=${skip}&limit=${limit}`),
  getById: (id: number) => api.get(`/api/orders/${id}`),
  update: (id: number, data: any) => api.put(`/api/orders/${id}`, data),
  getCustomerOrders: (customerId: number) => api.get(`/api/orders/customer/${customerId}`),
}

// Documents API
export const documentsAPI = {
  upload: (businessId: number, formData: FormData) =>
    api.post(`/api/documents/upload?business_id=${businessId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (businessId: number) => api.get(`/api/documents/?business_id=${businessId}`),
  getById: (id: number) => api.get(`/api/documents/${id}`),
  delete: (id: number) => api.delete(`/api/documents/${id}`),
}

export default api

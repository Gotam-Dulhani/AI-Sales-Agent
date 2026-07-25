import { create } from 'zustand'

interface User {
  id: number
  email: string
  full_name?: string
  phone?: string
  is_active: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

// Initialize auth from localStorage (client-side only)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token && user) {
    try {
      useAuth.setState({ user: JSON.parse(user), token, isAuthenticated: true })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

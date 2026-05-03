import { create } from 'zustand'

interface AuthState {
  user: any | null
  token: string | null
  isAuthenticated: boolean
  mfaRequired: boolean
  login: (email: string, password: string) => Promise<void>
  setupMFA: () => Promise<void>
  verifyMFA: (token: string) => Promise<void>
  logout: () => void
  setUser: (user: any) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  mfaRequired: false,

  login: async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      set({ token: data.access_token, user: data.user, isAuthenticated: true });
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  },

  setupMFA: async () => {
    // TODO: Implement MFA setup
  },

  verifyMFA: async (token: string) => {
    // TODO: Implement MFA verification
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
  },

  setUser: (user: any) => {
    set({ user, isAuthenticated: true })
  },
}))

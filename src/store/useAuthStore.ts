// src/store/useAuthStore.ts
import { create } from 'zustand';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Importante para las cookies
        mode: 'cors', // Asegurar que las cookies se manejen correctamente
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        set({ 
          user: data.user, 
          token: data.token || null,
          isLoading: false,
          error: null 
        });
        return true;
      } else {
        set({ 
          error: data.message || 'Error en el login',
          isLoading: false 
        });
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      set({ 
        error: 'Error de conexión',
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      set({ user: null, token: null, error: null });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        mode: 'cors',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          set({ user: data.user, isLoading: false });
        } else {
          set({ user: null, isLoading: false });
        }
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error en checkAuth:', error);
      set({ user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

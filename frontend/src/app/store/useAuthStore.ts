import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      
      setAuth: (accessToken: string, user: User) => 
        set({ accessToken, user }),
      
      setUser: (user: User) => set({ user }),
      
      logout: () => set({ 
        accessToken: null, 
        user: null,
        isInitialized: true
      }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '@/types/auth';


interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [refreshPromise, setRefreshPromise] = useState<Promise<string | null> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.log('Не удалось восстановить сессию:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    setIsRefreshing(true);
    const promise = (async () => {
      try {
        console.log("refreshAccessToken")
        const response = await fetch(`${API_URL}/api/tokens/refreshToken`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        
        const newAuthState = {
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
        };
        
        setAuthState(newAuthState);
        return data.accessToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        setAuthState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return null;
      }
    })();

    setRefreshPromise(promise);
    
    promise.finally(() => {
      setIsRefreshing(false);
      setRefreshPromise(null);
    });

    return promise;
  }, [isRefreshing, refreshPromise, API_URL]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    console.log("login")
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();

      setAuthState({
        user: {
          _id: data._id,
          username: data.username,
          email: data.email,
          profilePicture: data.profilePicture,
          createdAt: data.createdAt,
          __v: data.__v,
        },
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    console.log("logout")
    try {
      const response = await fetch(`${API_URL}/api/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    console.log("register")
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();

      setAuthState({
        user: {
          _id: data._id,
          username: data.username,
          email: data.email,
          profilePicture: data.profilePicture,
          createdAt: data.createdAt,
          __v: data.__v,
        },
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('User registered and authenticated successfully');
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value = {
    ...authState,
    login,
    logout,
    register,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
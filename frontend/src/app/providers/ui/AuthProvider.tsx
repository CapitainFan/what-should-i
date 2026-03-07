'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuthState, LoginCredentials, RegisterCredentials, AuthContext, authApi } from '@/features/auth/index';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [refreshPromise, setRefreshPromise] = useState<Promise<string | null> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        const data = await authApi.refreshToken();
        setAuthState({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
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
  }, [isRefreshing, refreshPromise]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const data = await authApi.login(credentials);
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

  const logout = async () => {
    try {
      if (authState.accessToken) {
        await authApi.logout(authState.accessToken);
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

  const register = async (credentials: RegisterCredentials) => {
    try {
      const data = await authApi.register(credentials);
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
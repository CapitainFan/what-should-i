'use client';

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import {
    AuthContext,
    AuthContextValue,
    AuthState,
    LoginCredentials,
    RegisterCredentials,
    loginUser,
    registerUser,
    logoutUser,
    refreshToken
} from '@/features/auth/index';


export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
      } catch {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing && refreshPromise) return refreshPromise;

    setIsRefreshing(true);
    const promise = (async () => {
      try {
        const data = await refreshToken();
        if (!data) throw new Error('Refresh failed');

        setAuthState({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return data.accessToken;
      } catch {
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
    const data = await loginUser(credentials);
    setAuthState({
      user: {
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture ?? null,
        createdAt: data.createdAt,
      },
      accessToken: data.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (credentials: RegisterCredentials) => {
    const data = await registerUser(credentials);
    setAuthState({
      user: {
        _id: data._id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture ?? null,
        createdAt: data.createdAt,
      },
      accessToken: data.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    if (authState.accessToken) {
      try {
        await logoutUser(authState.accessToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setAuthState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    register,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
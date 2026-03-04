'use client';

import { useContext, useCallback } from 'react';

import { AuthContext } from './context'


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const useAuthFetch = () => {
  const { accessToken, refreshAccessToken } = useAuth();

  const authFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    let token = accessToken;
    
    const makeRequest = async (currentToken: string | null) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
      };

      return fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
    };

    let response = await makeRequest(token);

    if (response.status === 401 && !url.includes('/refreshToken')) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        response = await makeRequest(newToken);
      } else {
        throw new Error('Authentication failed');
      }
    }

    return response;
  }, [accessToken, refreshAccessToken]);

  return authFetch;
};
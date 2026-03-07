'use client';

import { useCallback } from 'react';
import { useAuth } from './context';
import { BACK_API_URL } from '@/shared/config/api';

export const useAuthFetch = () => {
  const { accessToken, refreshAccessToken } = useAuth();

  const authFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const fullUrl = url.startsWith('http') ? url : `${BACK_API_URL}${url}`;
    
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
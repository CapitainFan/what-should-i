import { BACK_API_URL } from '@/shared/config/api';
import { LoginCredentials, RegisterCredentials, LoginResponse, RefreshTokenResponse } from '../model/types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await fetch(`${BACK_API_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    return res.json();
  },

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    const res = await fetch(`${BACK_API_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }
    return res.json();
  },

  async logout(accessToken: string): Promise<void> {
    const res = await fetch(`${BACK_API_URL}/api/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Logout failed');
    }
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const res = await fetch(`${BACK_API_URL}/api/tokens/refreshToken`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }
    return res.json();
  },
};
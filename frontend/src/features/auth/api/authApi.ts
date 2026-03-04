import { LoginCredentials, RegisterCredentials } from '../model/types';
import { User } from '@/entities/user/model/types'
import { API_URL } from '@/shared/config/api'

interface LoginResponse {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
  __v: number;
  accessToken: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

export const registerUser = async (credentials: RegisterCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
};

export const logoutUser = async (accessToken: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

export const refreshToken = async (): Promise<{ user: User; accessToken: string } | null> => {
  const response = await fetch(`${API_URL}/api/tokens/refreshToken`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) return null;
  return response.json();
};
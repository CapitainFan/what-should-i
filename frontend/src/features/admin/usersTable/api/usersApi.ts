import { User } from '@/entities/user/model/types';

export interface UsersResponse {
  count: number;
  users: User[];
}

export const fetchUsers = async (authFetch: (url: string, options?: RequestInit) => Promise<Response>): Promise<UsersResponse> => {
  const response = await authFetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};
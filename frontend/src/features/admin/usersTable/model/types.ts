import { User } from '@/entities/user/model/types';

export interface UsersData {
  count: number;
  users: User[];
}
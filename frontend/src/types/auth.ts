export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  createdAt: string;
  __v: number;
}

export interface LoginResponse {
  _id: string;
  username: string;
  email: string;
  profilePicture: null;
  createdAt: string;
  __v: number;
  accessToken: string;
  accessTokenExpiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: User;
  accessTokenExpiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
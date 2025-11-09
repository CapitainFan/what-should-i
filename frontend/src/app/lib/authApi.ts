import axiosInstance from './axios';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface VerifyResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
  };
  accessToken: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/users/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/users/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/users/logout');
  },

  refreshToken: async () => {
    const response = await axiosInstance.post<{ accessToken: string; user: any }>('/tokens/refresh');
    return response.data;
  },

  verify: async (): Promise<VerifyResponse> => {
    const response = await axiosInstance.get<VerifyResponse>('/tokens/verify');
    return response.data;
  },
};
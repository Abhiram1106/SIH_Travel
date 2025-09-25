import { apiService } from './apiService';
import { User, LoginRequest, RegisterRequest } from '../types';

class AuthService {
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await apiService.post<{ user: User; token: string }>('/auth/login', credentials);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  }

  async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await apiService.post<{ user: User; token: string }>('/auth/register', userData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  }

  async verifyToken(token: string): Promise<User> {
    const response = await apiService.get<User>('/auth/verify');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Token verification failed');
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiService.post('/auth/forgot-password', { email });
    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await apiService.post('/auth/reset-password', { token, password });
    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }
}

export const authService = new AuthService();
// Simple authentication service for FinDeep
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001/api';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token and user from localStorage on initialization
    this.token = localStorage.getItem('findeep-token');
    const userStr = localStorage.getItem('findeep-user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        this.logout();
      }
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Store token and user
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('findeep-token', data.token);
      localStorage.setItem('findeep-user', JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(username: string, email: string, password: string, name: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, name }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Store token and user
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('findeep-token', data.token);
      localStorage.setItem('findeep-user', JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async loginWithGoogle(googleToken: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Google login failed');
      }

      if (!data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      // Store token and user
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('findeep-token', data.token);
      localStorage.setItem('findeep-user', JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('findeep-token');
    localStorage.removeItem('findeep-user');
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();

// Backend API service for authentication and chat persistence
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface User {
  userID: string;
  username: string;
  email: string;
  name: string;
  profile: {
    avatar?: string;
    bio?: string;
    preferences: {
      theme: string;
      language: string;
    };
  };
  apiKeys: {
    openai: {
      key: string;
      isActive: boolean;
    };
    claude: {
      key: string;
      isActive: boolean;
    };
  };
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatSession {
  sessionID: string;
  userID: string;
  title: string;
  description: string;
  tags: string[];
  isActive: boolean;
  lastMessageAt: string;
  messageCount: number;
  metadata: {
    aiProvider: string;
    model?: string;
    totalTokens: number;
    totalCost: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Message {
  messageID: string;
  sessionID: string;
  userID: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments: any[];
  metadata: {
    aiProvider?: string;
    model?: string;
    tokens?: number;
    cost?: number;
    processingTime?: number;
    error?: string;
  };
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

class BackendApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('findeep-token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options.headers) {
      if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else if (typeof options.headers === 'object') {
        Object.assign(headers, options.headers);
      }
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('findeep-token', this.token);
      localStorage.setItem('findeep-user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('findeep-token', this.token);
      localStorage.setItem('findeep-user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/profile');
    return response.data!.user;
  }

  async updateProfile(profileData: {
    name?: string;
    bio?: string;
    preferences?: any;
  }): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data!.user;
  }

  async updateApiKey(provider: 'openai' | 'claude', key: string): Promise<void> {
    await this.request('/auth/api-keys', {
      method: 'PUT',
      body: JSON.stringify({ provider, key }),
    });
  }

  // Chat methods
  async getChatSessions(): Promise<ChatSession[]> {
    const response = await this.request<{ sessions: ChatSession[] }>('/chat/sessions');
    return response.data!.sessions;
  }

  async createChatSession(title?: string, description?: string): Promise<ChatSession> {
    const response = await this.request<{ session: ChatSession }>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
    return response.data!.session;
  }

  async getMessages(sessionID: string, page = 1, limit = 50): Promise<{
    session: ChatSession;
    messages: Message[];
    pagination: any;
  }> {
    const response = await this.request<{
      session: ChatSession;
      messages: Message[];
      pagination: any;
    }>(`/chat/sessions/${sessionID}/messages?page=${page}&limit=${limit}`);
    return response.data!;
  }

  async saveMessage(sessionID: string, messageData: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments?: any[];
    metadata?: any;
  }): Promise<Message> {
    const response = await this.request<{ message: Message }>(`/chat/sessions/${sessionID}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
    return response.data!.message;
  }

  async updateSession(sessionID: string, updates: {
    title?: string;
    description?: string;
  }): Promise<ChatSession> {
    const response = await this.request<{ session: ChatSession }>(`/chat/sessions/${sessionID}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!.session;
  }

  async deleteSession(sessionID: string): Promise<void> {
    await this.request(`/chat/sessions/${sessionID}`, {
      method: 'DELETE',
    });
  }

  async deleteMessage(messageID: string): Promise<void> {
    await this.request(`/chat/messages/${messageID}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('findeep-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('findeep-token');
    localStorage.removeItem('findeep-user');
  }
}

export const backendApi = new BackendApiService();
export type { User, ChatSession, Message };

const API_URL = 'https://functions.poehali.dev/338c6962-3a61-48f8-b905-f31ebfc46cdc';
const AUTH_URL = 'https://functions.poehali.dev/f54c45d7-c3b0-4e3f-a8cf-569c11ea1da2';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  is_online?: boolean;
}

export interface Chat {
  id: number;
  type: 'private' | 'group' | 'channel' | 'bot';
  name?: string;
  username?: string;
  description?: string;
  avatar_url?: string;
  is_pinned: boolean;
  is_muted: boolean;
  members?: number;
  unread_count: number;
  last_message?: {
    id: number;
    text: string;
    created_at: string;
    sender_id: number;
    first_name: string;
    last_name?: string;
  };
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
  text?: string;
  message_type: string;
  media_url?: string;
  media_name?: string;
  is_edited: boolean;
  is_forwarded: boolean;
  created_at: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    selected: boolean;
  }>;
}

export class TelegramAPI {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('telegram_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('telegram_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('telegram_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async register(username: string, password: string, firstName: string, lastName?: string, phone?: string) {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    this.setToken(data.token);
    return data.user as User;
  }

  async login(username: string, password: string) {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        username,
        password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    this.setToken(data.token);
    return data.user as User;
  }

  async verifyToken() {
    if (!this.token) return null;

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action: 'verify' }),
    });

    const data = await response.json();
    if (!response.ok) {
      this.clearToken();
      return null;
    }

    return data.user as User;
  }

  async getChats(): Promise<Chat[]> {
    const response = await fetch(`${API_URL}?path=chats`, {
      headers: this.getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch chats');
    }

    return data.chats;
  }

  async getMessages(chatId: number, limit = 50, offset = 0): Promise<Message[]> {
    const response = await fetch(`${API_URL}?path=messages/${chatId}&limit=${limit}&offset=${offset}`, {
      headers: this.getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch messages');
    }

    return data.messages;
  }

  async sendMessage(chatId: number, text: string, messageType = 'text'): Promise<Message> {
    const response = await fetch(`${API_URL}?path=send`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        chat_id: chatId,
        text,
        message_type: messageType,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data.message;
  }

  async createChat(type: string, name?: string, username?: string, memberIds: number[] = []): Promise<Chat> {
    const response = await fetch(`${API_URL}?path=create-chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        type,
        name,
        username,
        member_ids: memberIds,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create chat');
    }

    return data.chat;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`${API_URL}?path=search-users&q=${encodeURIComponent(query)}`, {
      headers: this.getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to search users');
    }

    return data.users;
  }
}

export const api = new TelegramAPI();

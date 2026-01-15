export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
  phone?: string;
}

export interface Chat {
  id: number;
  type: 'private' | 'group' | 'channel' | 'bot';
  name: string;
  username?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  members?: number;
  description?: string;
  online?: boolean;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  text: string;
  timestamp: Date;
  edited?: boolean;
  forwarded?: boolean;
  replyTo?: number;
  attachments?: Attachment[];
  reactions?: Reaction[];
}

export interface Attachment {
  id: number;
  type: 'photo' | 'video' | 'file' | 'voice' | 'sticker';
  url: string;
  name?: string;
  size?: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  selected: boolean;
}

export interface Channel extends Chat {
  type: 'channel';
  subscribers: number;
  isVerified: boolean;
  canPost: boolean;
}

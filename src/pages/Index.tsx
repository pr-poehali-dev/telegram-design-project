import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import Sidebar from '@/components/Sidebar';
import ChatView from '@/components/ChatView';
import ChatInfo from '@/components/ChatInfo';
import ProfileView from '@/components/ProfileView';
import { api, User, Chat as APIChat, Message as APIMessage } from '@/lib/api';
import { Chat, Message } from '@/types/telegram';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadChats();
      const interval = setInterval(loadChats, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChatId && user) {
      loadMessages(selectedChatId);
      const interval = setInterval(() => loadMessages(selectedChatId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatId, user]);

  const checkAuth = async () => {
    try {
      const verifiedUser = await api.verifyToken();
      setUser(verifiedUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      const apiChats = await api.getChats();
      const convertedChats: Chat[] = apiChats.map((chat: APIChat) => ({
        id: chat.id,
        type: chat.type,
        name: chat.name || `Chat ${chat.id}`,
        username: chat.username,
        description: chat.description,
        avatar: chat.avatar_url,
        lastMessage: chat.last_message ? {
          id: chat.last_message.id,
          chatId: chat.id,
          senderId: chat.last_message.sender_id,
          senderName: `${chat.last_message.first_name} ${chat.last_message.last_name || ''}`.trim(),
          text: chat.last_message.text,
          timestamp: new Date(chat.last_message.created_at),
        } : undefined,
        unreadCount: chat.unread_count || 0,
        pinned: chat.is_pinned,
        muted: chat.is_muted,
        members: chat.members,
        online: false,
      }));
      setChats(convertedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const apiMessages = await api.getMessages(chatId);
      const convertedMessages: Message[] = apiMessages.map((msg: APIMessage) => ({
        id: msg.id,
        chatId: msg.chat_id,
        senderId: msg.sender_id,
        senderName: `${msg.first_name} ${msg.last_name || ''}`.trim(),
        text: msg.text || '',
        timestamp: new Date(msg.created_at),
        edited: msg.is_edited,
        forwarded: msg.is_forwarded,
        reactions: msg.reactions,
      }));
      setMessages(prev => ({ ...prev, [chatId]: convertedMessages }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChatId || !user) return;

    try {
      await api.sendMessage(selectedChatId, text);
      await loadMessages(selectedChatId);
      await loadChats();
    } catch (error) {
      toast({
        title: 'Ошибка отправки',
        description: error instanceof Error ? error.message : 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChatId(chatId);
    setShowProfile(false);
    setShowChatInfo(false);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setSelectedChatId(null);
    setShowChatInfo(false);
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setChats([]);
    setMessages({});
    setSelectedChatId(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onShowProfile={handleShowProfile}
      />

      {showProfile ? (
        <ProfileView
          user={{
            id: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            bio: user.bio,
            avatar: user.avatar_url,
            online: true,
            phone: user.phone,
          }}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={handleUpdateProfile}
        />
      ) : selectedChat ? (
        <>
          <ChatView
            chat={selectedChat}
            messages={messages[selectedChat.id] || []}
            onSendMessage={handleSendMessage}
            onShowInfo={() => setShowChatInfo(true)}
          />
          {showChatInfo && (
            <ChatInfo chat={selectedChat} onClose={() => setShowChatInfo(false)} />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center max-w-md px-6">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-6xl">💬</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Выберите чат</h2>
            <p className="text-muted-foreground">
              Выберите чат из списка слева, чтобы начать общение
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

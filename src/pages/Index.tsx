import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatView from '@/components/ChatView';
import ChatInfo from '@/components/ChatInfo';
import ProfileView from '@/components/ProfileView';
import { mockChats, mockMessages, currentUser } from '@/data/mockData';
import { Chat, Message, User } from '@/types/telegram';

const Index = () => {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(1);
  const [messages, setMessages] = useState<Record<number, Message[]>>(mockMessages);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<User>(currentUser);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  const handleSendMessage = (text: string) => {
    if (!selectedChatId) return;

    const newMessage: Message = {
      id: (messages[selectedChatId]?.length || 0) + 1,
      chatId: selectedChatId,
      senderId: user.id,
      senderName: 'Вы',
      text,
      timestamp: new Date(),
    };

    setMessages({
      ...messages,
      [selectedChatId]: [...(messages[selectedChatId] || []), newMessage],
    });

    setChats(
      chats.map((chat) =>
        chat.id === selectedChatId
          ? { ...chat, lastMessage: newMessage, unreadCount: 0 }
          : chat
      )
    );
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChatId(chatId);
    setShowProfile(false);
    setShowChatInfo(false);

    setChats(
      chats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );

    if (!messages[chatId]) {
      setMessages({
        ...messages,
        [chatId]: [],
      });
    }
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setSelectedChatId(null);
    setShowChatInfo(false);
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    setUser({ ...user, ...updates });
  };

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
          user={user}
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

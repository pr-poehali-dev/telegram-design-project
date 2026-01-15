import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isBot?: boolean;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isMine: boolean;
}

const Index = () => {
  const [chats] = useState<Chat[]>([
    {
      id: 1,
      name: 'Александра Иванова',
      avatar: '',
      lastMessage: 'Отлично, созвонимся завтра!',
      time: '14:23',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: 'Команда разработки',
      avatar: '',
      lastMessage: 'Дмитрий: Код отправлен на ревью',
      time: '13:45',
      unread: 5,
      online: false,
    },
    {
      id: 3,
      name: 'Мама ❤️',
      avatar: '',
      lastMessage: 'Как дела, сынок?',
      time: '12:30',
      unread: 0,
      online: true,
    },
    {
      id: 4,
      name: 'TaskBot',
      avatar: '',
      lastMessage: 'У вас 3 новых задачи',
      time: '11:15',
      unread: 1,
      online: true,
      isBot: true,
    },
  ]);

  const [bots] = useState<Chat[]>([
    {
      id: 101,
      name: 'TaskBot',
      avatar: '',
      lastMessage: 'Управление задачами и напоминаниями',
      time: '',
      unread: 0,
      online: true,
      isBot: true,
    },
    {
      id: 102,
      name: 'WeatherBot',
      avatar: '',
      lastMessage: 'Прогноз погоды в режиме реального времени',
      time: '',
      unread: 0,
      online: true,
      isBot: true,
    },
    {
      id: 103,
      name: 'NewsBot',
      avatar: '',
      lastMessage: 'Актуальные новости из надёжных источников',
      time: '',
      unread: 0,
      online: true,
      isBot: true,
    },
    {
      id: 104,
      name: 'TranslateBot',
      avatar: '',
      lastMessage: 'Мгновенный перевод на 100+ языков',
      time: '',
      unread: 0,
      online: true,
      isBot: true,
    },
  ]);

  const [selectedChat, setSelectedChat] = useState<Chat>(chats[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Привет! Как прошла презентация?',
      time: '14:15',
      isMine: false,
    },
    {
      id: 2,
      text: 'Отлично! Клиенту понравилось наше предложение 🎉',
      time: '14:18',
      isMine: true,
    },
    {
      id: 3,
      text: 'Супер! Когда обсудим детали?',
      time: '14:20',
      isMine: false,
    },
    {
      id: 4,
      text: 'Отлично, созвонимся завтра!',
      time: '14:23',
      isMine: false,
    },
  ]);

  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('chats');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: messageInput,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          isMine: true,
        },
      ]);
      setMessageInput('');
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setActiveTab('chats');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <Icon name="Menu" size={24} />
          </Button>
          <Input
            placeholder="Поиск..."
            className="flex-1 bg-secondary border-0"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-border px-2">
            <TabsTrigger
              value="chats"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              Чаты
            </TabsTrigger>
            <TabsTrigger
              value="bots"
              className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              Боты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-4 border-b border-border cursor-pointer transition-all hover:bg-secondary ${
                    selectedChat.id === chat.id ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {chat.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{chat.name}</h3>
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <Badge className="ml-2 bg-primary text-primary-foreground">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="bots" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  onClick={() => handleChatSelect(bot)}
                  className="p-4 border-b border-border cursor-pointer transition-all hover:bg-secondary"
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={bot.avatar} />
                      <AvatarFallback className="bg-accent/20 text-accent">
                        <Icon name="Bot" size={20} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{bot.name}</h3>
                        <Badge variant="outline" className="text-xs border-accent text-accent">
                          Бот
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bot.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedChat.avatar} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {selectedChat.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{selectedChat.name}</h2>
              <p className="text-xs text-muted-foreground">
                {selectedChat.online ? 'в сети' : 'был(а) недавно'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Icon name="Search" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Icon name="Phone" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Icon name="Video" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Icon name="MoreVertical" size={20} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl ${
                    message.isMine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card text-card-foreground rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    {message.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Icon name="Paperclip" size={20} />
            </Button>
            <Input
              placeholder="Введите сообщение..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-secondary border-0"
            />
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Icon name="Smile" size={20} />
            </Button>
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-80 border-l border-border p-6">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={selectedChat.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-3xl">
              {selectedChat.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mb-1">{selectedChat.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {selectedChat.online ? 'в сети' : 'был(а) недавно'}
          </p>

          {selectedChat.isBot && (
            <Badge className="mb-6 bg-accent text-accent-foreground">
              <Icon name="Bot" size={14} className="mr-1" />
              Бот
            </Badge>
          )}

          <div className="w-full space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Bell" size={18} className="mr-2" />
              Уведомления
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Image" size={18} className="mr-2" />
              Медиа и файлы
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Search" size={18} className="mr-2" />
              Поиск в чате
            </Button>
            {selectedChat.isBot && (
              <Button variant="outline" className="w-full justify-start">
                <Icon name="Settings" size={18} className="mr-2" />
                Настройки бота
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

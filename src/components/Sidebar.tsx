import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/types/telegram';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SidebarProps {
  chats: Chat[];
  selectedChatId: number | null;
  onChatSelect: (chatId: number) => void;
  onShowProfile: () => void;
}

const Sidebar = ({ chats, selectedChatId, onChatSelect, onShowProfile }: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин`;
    if (hours < 24) return `${hours} ч`;
    if (days < 7) return `${days} дн`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getChatIcon = (type: Chat['type']) => {
    switch (type) {
      case 'channel':
        return <Icon name="Radio" size={16} />;
      case 'group':
        return <Icon name="Users" size={16} />;
      case 'bot':
        return <Icon name="Bot" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-[420px] border-r border-border flex flex-col bg-background">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Icon name="Menu" size={24} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Меню</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onShowProfile();
                  setMenuOpen(false);
                }}
              >
                <Icon name="User" size={18} className="mr-2" />
                Мой профиль
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Users" size={18} className="mr-2" />
                Создать группу
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Radio" size={18} className="mr-2" />
                Создать канал
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="UserPlus" size={18} className="mr-2" />
                Контакты
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Bot" size={18} className="mr-2" />
                Найти ботов
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Settings" size={18} className="mr-2" />
                Настройки
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 relative">
          <Icon
            name="Search"
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-0"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={`p-3 border-b border-border cursor-pointer transition-colors hover:bg-secondary/50 ${
              selectedChatId === chat.id ? 'bg-secondary' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {chat.type === 'bot' ? (
                      <Icon name="Bot" size={20} />
                    ) : (
                      chat.name.charAt(0)
                    )}
                  </AvatarFallback>
                </Avatar>
                {chat.online && chat.type === 'private' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <h3 className="font-semibold truncate text-sm">{chat.name}</h3>
                    {chat.type !== 'private' && (
                      <span className="text-muted-foreground flex-shrink-0">
                        {getChatIcon(chat.type)}
                      </span>
                    )}
                    {chat.muted && (
                      <Icon name="BellOff" size={14} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                    {chat.lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                    {chat.pinned && (
                      <Icon name="Pin" size={14} className="text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground truncate flex-1">
                    {chat.lastMessage?.text || 'Нет сообщений'}
                  </p>
                  {chat.unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] px-1.5 text-xs">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </Badge>
                  )}
                </div>

                {chat.username && (
                  <p className="text-xs text-muted-foreground mt-0.5">@{chat.username}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Sidebar;

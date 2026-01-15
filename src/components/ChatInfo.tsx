import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chat } from '@/types/telegram';
import { Separator } from '@/components/ui/separator';

interface ChatInfoProps {
  chat: Chat;
  onClose: () => void;
}

const ChatInfo = ({ chat, onClose }: ChatInfoProps) => {
  return (
    <div className="w-[380px] border-l border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Информация</h2>
        <Button variant="ghost" size="icon" className="hover:bg-secondary h-8 w-8" onClick={onClose}>
          <Icon name="X" size={18} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-28 h-28 mb-4">
              <AvatarImage src={chat.avatar} />
              <AvatarFallback className="bg-primary/20 text-primary text-4xl">
                {chat.type === 'bot' ? <Icon name="Bot" size={40} /> : chat.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-semibold text-center mb-1">{chat.name}</h2>

            {chat.username && (
              <p className="text-sm text-muted-foreground mb-2">@{chat.username}</p>
            )}

            {chat.type === 'channel' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Radio" size={14} />
                <span>{chat.members?.toLocaleString()} подписчиков</span>
              </div>
            )}

            {chat.type === 'group' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Users" size={14} />
                <span>{chat.members} участников</span>
              </div>
            )}

            {chat.type === 'private' && (
              <p className="text-sm text-muted-foreground">
                {chat.online ? 'в сети' : 'был(а) недавно'}
              </p>
            )}

            {chat.type === 'bot' && (
              <Badge className="mt-2 bg-accent text-accent-foreground">
                <Icon name="Bot" size={14} className="mr-1" />
                Бот
              </Badge>
            )}
          </div>

          {chat.description && (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Описание</h3>
                <p className="text-sm text-muted-foreground">{chat.description}</p>
              </div>
              <Separator className="my-4" />
            </>
          )}

          {chat.username && (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Имя пользователя</h3>
                <div className="flex items-center justify-between bg-secondary p-3 rounded-lg">
                  <span className="text-sm text-primary">@{chat.username}</span>
                  <Button variant="ghost" size="sm" className="h-7">
                    <Icon name="Copy" size={14} className="mr-1" />
                    Копировать
                  </Button>
                </div>
              </div>
              <Separator className="my-4" />
            </>
          )}

          <div className="space-y-2">
            {chat.type === 'channel' && (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Bell" size={18} className="mr-3" />
                  Уведомления
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Search" size={18} className="mr-3" />
                  Поиск сообщений
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Share2" size={18} className="mr-3" />
                  Поделиться
                </Button>
              </>
            )}

            {chat.type === 'private' && (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Phone" size={18} className="mr-3" />
                  Позвонить
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Video" size={18} className="mr-3" />
                  Видеозвонок
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Bell" size={18} className="mr-3" />
                  Уведомления
                </Button>
              </>
            )}

            {chat.type === 'group' && (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Users" size={18} className="mr-3" />
                  Участники
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="UserPlus" size={18} className="mr-3" />
                  Добавить участников
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Bell" size={18} className="mr-3" />
                  Уведомления
                </Button>
              </>
            )}

            {chat.type === 'bot' && (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Settings" size={18} className="mr-3" />
                  Настройки бота
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Info" size={18} className="mr-3" />
                  О боте
                </Button>
              </>
            )}

            <Button variant="ghost" className="w-full justify-start">
              <Icon name="Image" size={18} className="mr-3" />
              Медиа, файлы и ссылки
            </Button>

            <Button variant="ghost" className="w-full justify-start">
              <Icon name="Search" size={18} className="mr-3" />
              Поиск в чате
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            {chat.type === 'channel' && (
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                <Icon name="LogOut" size={18} className="mr-3" />
                Отписаться
              </Button>
            )}

            {chat.type === 'group' && (
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                <Icon name="LogOut" size={18} className="mr-3" />
                Покинуть группу
              </Button>
            )}

            {chat.type === 'private' && (
              <>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                  <Icon name="Ban" size={18} className="mr-3" />
                  Заблокировать
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                  <Icon name="Trash2" size={18} className="mr-3" />
                  Удалить чат
                </Button>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatInfo;

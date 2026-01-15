import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat, Message } from '@/types/telegram';

interface ChatViewProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onShowInfo: () => void;
}

const ChatView = ({ chat, messages, onSendMessage, onShowInfo }: ChatViewProps) => {
  const [messageInput, setMessageInput] = useState('');

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getChatSubtitle = () => {
    if (chat.type === 'channel') {
      return `${chat.members?.toLocaleString()} подписчиков`;
    }
    if (chat.type === 'group') {
      return `${chat.members} участников`;
    }
    if (chat.online) {
      return 'в сети';
    }
    return 'был(а) недавно';
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={onShowInfo}>
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={chat.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {chat.type === 'bot' ? <Icon name="Bot" size={20} /> : chat.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm truncate">{chat.name}</h2>
              {chat.type === 'channel' && (
                <Icon name="Radio" size={14} className="text-muted-foreground" />
              )}
              {chat.type === 'bot' && (
                <Badge variant="outline" className="text-xs border-accent text-accent h-5 px-1">
                  БОТ
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{getChatSubtitle()}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9">
            <Icon name="Search" size={18} />
          </Button>
          {chat.type === 'private' && (
            <>
              <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9">
                <Icon name="Phone" size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9">
                <Icon name="Video" size={18} />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9">
            <Icon name="MoreVertical" size={18} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isMine = message.senderId === 1;
            const showAvatar =
              !isMine &&
              (chat.type === 'group' || chat.type === 'channel') &&
              (index === messages.length - 1 ||
                messages[index + 1]?.senderId !== message.senderId);

            return (
              <div
                key={message.id}
                className={`flex gap-2 animate-fade-in ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (chat.type === 'group' || chat.type === 'channel') && (
                  <Avatar className="w-8 h-8 flex-shrink-0" style={{ visibility: showAvatar ? 'visible' : 'hidden' }}>
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {message.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[65%]`}>
                  {!isMine && (chat.type === 'group' || chat.type === 'channel') && showAvatar && (
                    <span className="text-xs font-semibold text-primary mb-1">
                      {message.senderName}
                    </span>
                  )}

                  <div
                    className={`px-3 py-2 rounded-2xl ${
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span
                        className={`text-[10px] ${
                          isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                      {message.edited && (
                        <span
                          className={`text-[10px] ${
                            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          изм.
                        </span>
                      )}
                      {isMine && (
                        <Icon
                          name="CheckCheck"
                          size={14}
                          className={isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                        />
                      )}
                    </div>
                  </div>

                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {message.reactions.map((reaction, i) => (
                        <button
                          key={i}
                          className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                            reaction.selected
                              ? 'bg-primary/20 border border-primary'
                              : 'bg-secondary border border-border hover:bg-secondary/80'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-[10px] text-muted-foreground">{reaction.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9 flex-shrink-0">
            <Icon name="Paperclip" size={18} />
          </Button>

          <div className="flex-1 bg-secondary rounded-lg">
            <Input
              placeholder="Написать сообщение..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9 flex-shrink-0">
            <Icon name="Smile" size={18} />
          </Button>

          {messageInput.trim() ? (
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9 flex-shrink-0"
            >
              <Icon name="Send" size={18} />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9 flex-shrink-0">
              <Icon name="Mic" size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;

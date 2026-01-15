import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from '@/types/telegram';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface ProfileViewProps {
  user: User;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const ProfileView = ({ user, onClose, onUpdateProfile }: ProfileViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleSave = () => {
    onUpdateProfile(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-secondary h-9 w-9" onClick={onClose}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h2 className="font-semibold">Профиль</h2>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Отмена
            </Button>
            <Button size="sm" onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Icon name="Pencil" size={16} className="mr-2" />
            Редактировать
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/20 text-primary text-4xl">
                  {user.firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  <Icon name="Camera" size={18} />
                </Button>
              )}
            </div>

            {!isEditing && (
              <>
                <h2 className="text-2xl font-semibold mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-muted-foreground">@{user.username}</p>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Личная информация</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs text-muted-foreground mb-1 block">
                    Имя
                  </Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editedUser.firstName}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, firstName: e.target.value })
                      }
                      className="bg-secondary border-0"
                    />
                  ) : (
                    <p className="text-sm py-2">{user.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-xs text-muted-foreground mb-1 block">
                    Фамилия
                  </Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editedUser.lastName || ''}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, lastName: e.target.value })
                      }
                      className="bg-secondary border-0"
                    />
                  ) : (
                    <p className="text-sm py-2">{user.lastName || 'Не указана'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio" className="text-xs text-muted-foreground mb-1 block">
                    О себе
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={editedUser.bio || ''}
                      onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                      className="bg-secondary border-0 resize-none"
                      rows={3}
                      placeholder="Расскажите о себе..."
                    />
                  ) : (
                    <p className="text-sm py-2 text-muted-foreground">
                      {user.bio || 'Не указано'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-semibold mb-3 block">Аккаунт</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-xs text-muted-foreground mb-1 block">
                    Имя пользователя
                  </Label>
                  {isEditing ? (
                    <div className="flex items-center bg-secondary rounded-lg">
                      <span className="pl-3 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        value={editedUser.username}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, username: e.target.value })
                        }
                        className="bg-transparent border-0"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-secondary p-3 rounded-lg">
                      <span className="text-sm text-primary">@{user.username}</span>
                      <Button variant="ghost" size="sm" className="h-7">
                        <Icon name="Copy" size={14} className="mr-1" />
                        Копировать
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    По этому адресу вас смогут найти другие пользователи
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs text-muted-foreground mb-1 block">
                    Номер телефона
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedUser.phone || ''}
                      onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                      className="bg-secondary border-0"
                      placeholder="+7 999 123-45-67"
                    />
                  ) : (
                    <p className="text-sm py-2">{user.phone || 'Не указан'}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-semibold mb-3 block">Настройки</Label>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Bell" size={18} className="mr-3" />
                  Уведомления и звуки
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Lock" size={18} className="mr-3" />
                  Конфиденциальность
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Database" size={18} className="mr-3" />
                  Данные и память
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Palette" size={18} className="mr-3" />
                  Оформление
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Globe" size={18} className="mr-3" />
                  Язык
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                <Icon name="LogOut" size={18} className="mr-3" />
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProfileView;

import { Chat } from '@/entities/chat/model/types';
import { ChatItem } from './ChatItem';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  onSelectChat: (chatId: string) => void;
  onUpdateChatName: (chatId: string, newName: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRetry: () => void;
  onNewChat: () => void;
}

export const ChatList = ({
  chats,
  loading,
  error,
  onSelectChat,
  onUpdateChatName,
  onDeleteChat,
  onRetry,
  onNewChat,
}: ChatListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
          <div className="text-gray-500">Loading chats...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">{error}</div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">No chats found. Create your first chat!</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-230px)] pr-4">
      <div className="space-y-2">
        {chats.map((chat) => (
          <ChatItem
            key={chat._id}
            chat={chat}
            onSelect={onSelectChat}
            onUpdateName={onUpdateChatName}
            onDelete={onDeleteChat}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
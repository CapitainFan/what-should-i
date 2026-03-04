import { useState } from 'react';
import { Chat } from '@/entities/chat/model/types';
import { Button } from '@/shared/ui/button';
import { FaRegEdit } from 'react-icons/fa';
import { EditChatInput } from './EditChatInput';
import { DeleteChatDialog } from './DeleteChatDialog';

interface ChatItemProps {
  chat: Chat;
  onSelect: (chatId: string) => void;
  onUpdateName: (chatId: string, newName: string) => void;
  onDelete: (chatId: string) => void;
}

export const ChatItem = ({ chat, onSelect, onUpdateName, onDelete }: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chat.name);

  const handleSave = () => {
    if (newName.trim() && newName !== chat.name) {
      onUpdateName(chat._id, newName.trim());
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-md transition-colors">
        <EditChatInput
          value={newName}
          onChange={setNewName}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-md transition-colors cursor-pointer group">
      <Button
        size="sm"
        className="font-medium truncate w-70"
        onClick={() => onSelect(chat._id)}
      >
        {chat.name.slice(0, 30) + (chat.name.length > 30 ? '...' : '')}
      </Button>

      <Button
        variant="outline"
        className="bg-blue-500 hover:bg-blue-600 h-9 w-9 text-white rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        <FaRegEdit />
      </Button>

      <DeleteChatDialog chatId={chat._id} onDelete={onDelete} />
    </div>
  );
};
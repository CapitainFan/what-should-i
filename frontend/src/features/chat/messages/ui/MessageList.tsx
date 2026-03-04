import { Message } from '@/entities/message/model/types';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
  isBotTyping: boolean;
  loading?: boolean;
  error?: string | null;
}

export const MessageList = ({ messages, isBotTyping, loading, error }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-sm sm:text-base">Загрузка сообщений...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-sm sm:text-base text-center px-4">{error}</div>
      </div>
    );
  }

  if (messages.length === 0 && !isBotTyping) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-sm sm:text-base">Нет сообщений</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {messages.map((message) => (
        <MessageItem key={message._id} message={message} />
      ))}
      {isBotTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};
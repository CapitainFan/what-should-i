import { Message } from '@/entities/message/model/types';
import { formatMessageDate } from '@/shared/lib/formatters';
import clsx from 'clsx';

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <div className={`flex ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={clsx(
          'max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4',
          message.isUserMessage
            ? 'bg-[hsla(0,0%,50%,0.342)] rounded-tr-none sm:rounded-tr-none'
            : 'bg-blue-500 text-white rounded-tl-none sm:rounded-tl-none',
          message.isTemporary && 'opacity-70'
        )}
      >
        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
          {message.text}
        </div>
        <div
          className={clsx(
            'text-xs mt-1 sm:mt-2',
            message.isUserMessage ? 'text-gray-600' : 'text-blue-100'
          )}
        >
          {formatMessageDate(message.createdAt)}
        </div>
      </div>
    </div>
  );
};
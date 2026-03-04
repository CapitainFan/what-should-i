import { CustomTextarea } from '@/shared/ui/customTextarea';
import { Button } from '@/shared/ui/button';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  buttonText?: string;
}

export const MessageInput = ({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Введите запрос',
  buttonText = 'Отправить',
}: MessageInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full relative">
      <CustomTextarea
        placeholder={placeholder}
        className="w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 px-3 py-1 sm:px-4 sm:py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
      >
        {buttonText}
      </Button>
    </div>
  );
};
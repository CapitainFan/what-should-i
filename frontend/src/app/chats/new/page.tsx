'use client'

import { CustomTextarea } from "@/components/ui/customTextarea"
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface WebSocketMessage {
  type: 'message_received' | 'ai_message' | 'error' | 'chat_created';
  text?: string;
  messageId?: string;
  chatId?: string;
  taskId?: string;
  chatName?: string;
  sessionId?: string;
}

export default function NewChat() {
  const { user, isLoading: AuthLoading, accessToken } = useAuth();
  const router = useRouter();
  
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (AuthLoading || !accessToken || wsRef.current) return;

    const socket = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_API_URL_SHORT}/ws?token=${accessToken}`
    );

    socket.onopen = () => {
      console.log('WebSocket connected for new chat');
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'ai_message' && data.chatId) {
          console.log('Chat created, redirecting...');
          router.replace(`/chats/${data.chatId}`);
        } else if (data.type === 'error') {
          setError(data.text || 'An error occurred');
          setIsSending(false);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
    };

    wsRef.current = socket;

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }
    };
  }, [AuthLoading, accessToken, router]);

  const sendMessage = async () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isSending) {
      return;
    }

    const messageText = input.trim();
    setIsSending(true);
    setError(null);

    try {
        wsRef.current.send(JSON.stringify({
        text: messageText
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center bg-gray-200 w-250 h-[calc(100vh-152px)] rounded-3xl mt-10">
        <div className="absolute inset-0 flex flex-col p-5 justify-center ">

          { isSending ? (
                <>
                  <div
                    className='flex justify-end'
                  >
                    <div
                      className='max-w-[80%] rounded-2xl p-4 bg-[hsla(0,0%,50%,0.342)] rounded-tr-none'
                    >
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {input.trim()}
                      </div>
                      <div
                        className='text-xs mt-2 text-gray-600'
                      >
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl p-4 bg-blue-500 text-white rounded-tl-none">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm">Бот печатает...</span>
                      </div>
                    </div>
                  </div>
                </>) : (<div className="self-center font-bold text-[17px] mb-4">
            Ask What Should You Do!
          </div>)}

          {error && (
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
              <div className="max-w-[80%] rounded-2xl p-4 bg-red-100 text-red-700">
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
          <CustomTextarea
            placeholder="Введите запрос"
            className="self-center bottom-[20px] absolute"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className="absolute right-5 bottom-9 px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Создать чат
          </button>
        </div>
      </div>
    </div>
  );
}
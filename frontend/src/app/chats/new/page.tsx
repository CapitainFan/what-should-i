'use client'

import { CustomTextarea } from "@/components/ui/customTextarea"
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ui/ProtectedRoute";

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

  if (AuthLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
  <ProtectedRoute>
    <div className="flex flex-col items-center justify-center w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="relative flex flex-col items-center bg-gray-200 w-full max-w-4xl h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-160px)] rounded-xl sm:rounded-2xl lg:rounded-3xl mt-4 sm:mt-6 lg:mt-8 lg:mt-10">
        <div className="absolute inset-0 flex flex-col p-3 sm:p-4 lg:p-5 justify-center items-center">

          { isSending ? (
                <>
                  <div className="w-full flex flex-col gap-2 sm:gap-3">
                    <div
                      className='flex justify-end'
                    >
                      <div
                        className='max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-[hsla(0,0%,50%,0.342)] rounded-tr-none sm:rounded-tr-none'
                      >
                        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                          {input.trim()}
                        </div>
                        <div
                          className='text-xs mt-1 sm:mt-2 text-gray-600'
                        >
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-blue-500 text-white rounded-tl-none sm:rounded-tl-none">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-xs sm:text-sm">Бот печатает...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>) : (
                <div className="text-center px-4">
                  <div className="font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-4">
                    Ask What Should You Do!
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                    Начните диалог с ИИ-помощником Ви. Задайте любой вопрос о выборе или решении!
                  </p>
                </div>
              )}

          {error && (
            <div className="w-full max-w-md px-4 sm:px-0">
              <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-red-100 text-red-700 text-sm sm:text-base text-center">
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <div className="w-full max-w-md mt-4 sm:mt-6 relative">
            <CustomTextarea
              placeholder="Введите запрос"
              className="w-full"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 px-3 py-1 sm:px-4 sm:py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              Создать чат
            </button>
          </div>
        </div>
      </div>
    </div>
  </ProtectedRoute>
  );
}
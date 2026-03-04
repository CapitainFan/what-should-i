'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/index';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { TypingIndicator, MessageItem, useChatWebSocket, MessageInput } from '@/features/chat/index';


export default function NewChatPage() {
  const { user, isLoading: authLoading, accessToken } = useAuth();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempMessage, setTempMessage] = useState<string | null>(null);

  const handleChatCreated = (chatId: string) => {
    router.replace(`/chats/${chatId}`);
  };

  const { isConnected, sendMessage } = useChatWebSocket({
    accessToken,
    onChatCreated: handleChatCreated,
    onError: setError,
  });

  const handleSendMessage = () => {
    if (!input.trim() || !isConnected || isSending) return;
    setTempMessage(input.trim());
    setIsSending(true);
    setError(null);
    sendMessage(input.trim());
    setInput('');
  };

  if (authLoading) {
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
            {isSending ? (
              <div className="w-full flex flex-col gap-2 sm:gap-3">
                {tempMessage && (
                  <MessageItem
                    message={{
                      _id: 'temp',
                      text: tempMessage,
                      isUserMessage: true,
                      createdAt: new Date().toISOString(),
                      isTemporary: true,
                    }}
                  />
                )}
                <TypingIndicator />
              </div>
            ) : (
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
              <div className="w-full max-w-md px-4 sm:px-0 mt-4">
                <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-red-100 text-red-700 text-sm sm:text-base text-center">
                  {error}
                </div>
              </div>
            )}

            <div className="w-full max-w-md mt-4 sm:mt-6">
              <MessageInput
                value={input}
                onChange={setInput}
                onSend={handleSendMessage}
                disabled={isSending || !isConnected}
                buttonText="Создать чат"
                placeholder="Введите запрос"
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
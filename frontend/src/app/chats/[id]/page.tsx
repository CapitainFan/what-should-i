'use client';

import { useParams } from 'next/navigation';
import { Message } from '@/entities/message/model/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useAuthFetch } from '@/features/auth/index';
import ProtectedRoute from '@/shared/ui/ProtectedRoute';
import { useChatWebSocket, MessageInput, MessageList, fetchMessages } from '@/features/chat/index';


export default function ChatPage() {
  const { user, isLoading: authLoading, accessToken } = useAuth();
  const authFetch = useAuthFetch();
  const params = useParams();
  const chatId = params?.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const hasFetchedRef = useRef(false);
  const pendingAiMessagesRef = useRef<Set<string>>(new Set());

  const handleMessageReceived = useCallback((messageId: string, taskId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isTemporary && msg.taskId === taskId ? { ...msg, _id: messageId, isTemporary: false } : msg
      )
    );
    setIsSending(false);
    setIsBotTyping(true);
  }, []);

  const handleAiMessage = useCallback((text: string, taskId?: string) => {
    if (taskId && pendingAiMessagesRef.current.has(taskId)) return;
    if (taskId) pendingAiMessagesRef.current.add(taskId);

    setMessages((prev) => [
      ...prev,
      {
        _id: taskId || Date.now().toString(),
        text: text || '',
        isUserMessage: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setIsBotTyping(false);
  }, []);

  const handleError = useCallback((text: string) => {
    setError(text);
    setIsSending(false);
    setIsBotTyping(false);
  }, []);

  const { isConnected, sendMessage } = useChatWebSocket({
    accessToken,
    chatId,
    onMessageReceived: handleMessageReceived,
    onAiMessage: handleAiMessage,
    onError: handleError,
  });

  useEffect(() => {
    if (authLoading || hasFetchedRef.current || !chatId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const msgs = await fetchMessages(authFetch, chatId);
        setMessages(msgs);
        const lastMsg = msgs[msgs.length - 1];
        setIsBotTyping(lastMsg?.isUserMessage ?? false);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Error loading messages');
      } finally {
        setLoading(false);
        hasFetchedRef.current = true;
      }
    };

    loadMessages();
  }, [authFetch, authLoading, chatId]);

  const handleSendMessage = async () => {
    if (!input.trim() || !isConnected || isSending || !chatId) return;

    const tempTaskId = Date.now().toString();
    const tempMessage: Message = {
      _id: `temp-${tempTaskId}`,
      text: input.trim(),
      isUserMessage: true,
      createdAt: new Date().toISOString(),
      isTemporary: true,
      taskId: tempTaskId,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setIsSending(true);
    setInput('');
    setIsBotTyping(false);

    const sent = sendMessage(input.trim());
    if (!sent) {
      setError('Failed to send message');
      setIsSending(false);
      setMessages((prev) => prev.filter((msg) => msg._id !== `temp-${tempTaskId}`));
    }
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
            <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2 w-full">
              <MessageList messages={messages} isBotTyping={isBotTyping} loading={loading} error={error} />
            </div>
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSendMessage}
              disabled={isSending || !isConnected}
              buttonText={isSending ? 'Отправка...' : 'Отправить'}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
'use client'

import { CustomTextarea } from "@/components/ui/customTextarea"
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useParams } from 'next/navigation';

export default function Chat() {
  const { user, isLoading: AuthLoading } = useAuth();
  const authFetch = useAuthFetch();

  const [messages, setMessages] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const chatId = params?.id;
  const hasFetchedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (AuthLoading || hasFetchedRef.current) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authFetch(`/api/chats/messagesFromChat/${chatId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Error loading messages');
      } finally {
        setLoading(false);
        hasFetchedRef.current = true;
      }
    };
    fetchMessages();
  }, [authFetch, AuthLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const monthNames = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    
    return `${time} ${month} ${day}`;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center bg-gray-200 w-250 h-[calc(100vh-152px)] rounded-3xl mt-10">
        <div className="absolute inset-0 flex flex-col p-5 justify-center items-center">

          <div className=" flex-1 overflow-y-auto mb-4 pr-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Загрузка сообщений...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500">{error}</div>
              </div>
            ) : messages?.messages?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {messages.messages.map((message: any) => (
                  <div
                    key={message._id}
                    className={`flex ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.isUserMessage
                          ? 'bg-[hsla(0,0%,50%,0.342)] rounded-tr-none'
                          : 'bg-blue-500 text-white rounded-tl-none'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.isUserMessage ? 'text-gray-600' : 'text-blue-100'
                        }`}
                      >
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Нет сообщений</div>
              </div>
            )}
          </div>

          <CustomTextarea
            placeholder="Введите запрос"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
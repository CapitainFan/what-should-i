'use client'

import { CustomTextarea } from "@/components/ui/customTextarea"
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useParams } from 'next/navigation';
import ProtectedRoute from "@/components/ui/ProtectedRoute";

interface Message {
  _id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: string;
  isTemporary?: boolean;
  taskId?: string;
}

interface MessagesData {
  messages: Message[];
}

interface WebSocketMessage {
  type: 'message_received' | 'ai_message' | 'error' | 'chat_created';
  text?: string;
  messageId?: string;
  chatId?: string;
  taskId?: string;
  chatName?: string;
  sessionId?: string;
}

export default function Chat() {
  const { user, isLoading: AuthLoading, accessToken } = useAuth();
  const authFetch = useAuthFetch();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const params = useParams();
  const chatId = params?.id;
  const hasFetchedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingAiMessagesRef = useRef<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  useEffect(() => {
    if (AuthLoading || !accessToken || !chatId) return;

    if (wsRef.current) {
      wsRef.current.close(1000, 'Reconnecting');
      wsRef.current = null;
    }

    const socket = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_API_URL_SHORT}/ws?token=${accessToken}`
    );

    socket.onopen = () => {
      console.log('WebSocket connected for chat:', chatId);
      setIsWsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        handleWebSocketMessage(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      setIsWsConnected(false);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
      setIsWsConnected(false);
    };

    wsRef.current = socket;
    setWs(socket);

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
        setWs(null);
      }
    };
  }, [AuthLoading, accessToken, chatId]);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case 'message_received':
        setMessages(prev => 
          prev.map(msg => 
            msg.isTemporary && msg.taskId === data.taskId
              ? { ...msg, _id: data.messageId!, isTemporary: false }
              : msg
          )
        );
        setIsSending(false);
        setIsBotTyping(true);
        break;

      case 'ai_message':
        if (data.taskId && pendingAiMessagesRef.current.has(data.taskId)) {
          return;
        }
        
        if (data.taskId) {
          pendingAiMessagesRef.current.add(data.taskId);
        }
        
        setMessages(prev => {
          const newMessage: Message = {
            _id: data.taskId || Date.now().toString(),
            text: data.text || '',
            isUserMessage: false,
            createdAt: new Date().toISOString()
          };
          
          return [...prev, newMessage];
        });
        setIsBotTyping(false);
        break;

      case 'error':
        setError(data.text || 'An error occurred');
        setIsSending(false);
        setIsBotTyping(false);
        break;

      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (AuthLoading || hasFetchedRef.current || !chatId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authFetch(`/api/chats/messagesFromChat/${chatId}`);
        
        if (response.ok) {
          const data: MessagesData = await response.json();
          console.log('Fetched messages:', data);
          
          setMessages(data.messages || []);
          
          if (data.messages && data.messages.length > 0) {
            const lastMessage = data.messages[data.messages.length - 1];
            
            if (lastMessage.isUserMessage) {
              setIsBotTyping(true);
            } else {
              setIsBotTyping(false);
            }
          }
        } else {
          throw new Error('Failed to fetch messages');
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
  }, [authFetch, AuthLoading, chatId]);

  const sendMessage = async () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN || isSending || !chatId) return;

    const tempTaskId = Date.now().toString();
    const tempMessage: Message = {
      _id: `temp-${tempTaskId}`,
      text: input.trim(),
      isUserMessage: true,
      createdAt: new Date().toISOString(),
      isTemporary: true,
      taskId: tempTaskId
    };

    setMessages(prev => [...prev, tempMessage]);

    setIsSending(true);
    setInput('');
    setIsBotTyping(false);

    try {
      ws.send(JSON.stringify({
        text: input.trim(),
        chatId: chatId
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setIsSending(false);
      
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${tempTaskId}`));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
          <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 pr-1 sm:pr-2 w-full">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-sm sm:text-base">Загрузка сообщений...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500 text-sm sm:text-base text-center px-4">{error}</div>
              </div>
            ) : messages.length > 0 || isBotTyping ? (
              <div className="flex flex-col gap-2 sm:gap-3">
                {messages.map((message: Message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.isUserMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
                        message.isUserMessage
                          ? 'bg-[hsla(0,0%,50%,0.342)] rounded-tr-none sm:rounded-tr-none'
                          : 'bg-blue-500 text-white rounded-tl-none sm:rounded-tl-none'
                      } ${message.isTemporary ? 'opacity-70' : ''}`}
                    >
                      <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </div>
                      <div
                        className={`text-xs mt-1 sm:mt-2 ${
                          message.isUserMessage ? 'text-gray-600' : 'text-blue-100'
                        }`}
                      >
                        {formatDate(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isBotTyping && (
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
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-sm sm:text-base">Нет сообщений</div>
              </div>
            )}
          </div>

          <div className="w-full relative">
            <CustomTextarea
              placeholder="Введите запрос"
              className="w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending || !isWsConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isSending || !isWsConnected}
              className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 px-3 py-1 sm:px-4 sm:py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              {isSending ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </ProtectedRoute>
  );
}
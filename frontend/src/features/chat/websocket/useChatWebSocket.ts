import { useEffect, useRef, useState, useCallback } from 'react';
import { createWebSocket, WebSocketMessage } from '@/shared/lib/websocket';

interface UseChatWebSocketProps {
  accessToken: string | null;
  chatId?: string;
  onMessageReceived?: (messageId: string, taskId: string) => void;
  onAiMessage?: (text: string, taskId?: string, chatId?: string) => void;
  onError?: (text: string) => void;
  onChatCreated?: (chatId: string) => void;
}

export const useChatWebSocket = ({
  accessToken,
  chatId,
  onMessageReceived,
  onAiMessage,
  onError,
  onChatCreated,
}: UseChatWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const onMessageReceivedRef = useRef(onMessageReceived);
  const onAiMessageRef = useRef(onAiMessage);
  const onErrorRef = useRef(onError);
  const onChatCreatedRef = useRef(onChatCreated);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onAiMessageRef.current = onAiMessage;
    onErrorRef.current = onError;
    onChatCreatedRef.current = onChatCreated;
  }, [onMessageReceived, onAiMessage, onError, onChatCreated]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = createWebSocket(accessToken);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected', chatId ? `for chat ${chatId}` : '');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        switch (data.type) {
          case 'message_received':
            onMessageReceivedRef.current?.(data.messageId, data.taskId);
            break;
          case 'ai_message':
            onAiMessageRef.current?.(data.text, data.taskId, data.chatId);
            break;
          case 'error':
            onErrorRef.current?.(data.text);
            break;
          case 'chat_created':
            onChatCreatedRef.current?.(data.chatId);
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      onErrorRef.current?.('WebSocket connection error');
      setIsConnected(false);
    };

    socket.onclose = (event) => {
      console.log(`WebSocket closed: ${event.code} ${event.reason}`);
      setIsConnected(false);
    };

    return () => {
      socket.close(1000, 'Component unmounting');
    };
  }, [accessToken, chatId]);

  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }
    wsRef.current.send(JSON.stringify({ text, chatId }));
    return true;
  }, [chatId]);

  return { isConnected, sendMessage };
};
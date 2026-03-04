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

  useEffect(() => {
    if (!accessToken) return;

    const socket = createWebSocket(accessToken);

    socket.onopen = () => {
      console.log('WebSocket connected', chatId ? `for chat ${chatId}` : '');
      setIsConnected(true);
    };

    socket.onmessage = (event: any) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        switch (data.type) {
          case 'message_received':
            onMessageReceived?.(data.messageId, data.taskId);
            break;
          case 'ai_message':
            onAiMessage?.(data.text, data.taskId, data.chatId);
            break;
          case 'error':
            onError?.(data.text);
            break;
          case 'chat_created':
            onChatCreated?.(data.chatId);
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (error: any) => {
      console.error('WebSocket error:', error);
      onError?.('WebSocket connection error');
      setIsConnected(false);
    };

    socket.onclose = (event: any) => {
      console.log(`WebSocket closed: ${event.code} ${event.reason}`);
      setIsConnected(false);
    };

    wsRef.current = socket;

    return () => {
      socket.close(1000, 'Component unmounting');
    };
  }, [accessToken, chatId, onMessageReceived, onAiMessage, onError, onChatCreated]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected');
        return false;
      }
      wsRef.current.send(JSON.stringify({ text, chatId }));
      return true;
    },
    [chatId]
  );

  return { isConnected, sendMessage };
};
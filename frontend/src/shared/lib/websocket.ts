import { BACK_URL_SHORT } from '@/shared/config/api'

export type WebSocketMessage =
  | { type: 'message_received'; messageId: string; taskId: string }
  | { type: 'ai_message'; text: string; taskId?: string; chatId?: string }
  | { type: 'error'; text: string }
  | { type: 'chat_created'; chatId: string; chatName?: string };

export const createWebSocket = (token: string): WebSocket => {
  return new WebSocket(`wss://${BACK_URL_SHORT}/ws?token=${token}`);
};
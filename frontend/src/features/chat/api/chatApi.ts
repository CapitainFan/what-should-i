import { Chat } from '@/entities/chat/model/types';
import { Message } from '@/entities/message/model/types';


export const fetchChats = async (authFetch: (url: string, options?: RequestInit) => Promise<Response>): Promise<Chat[]> => {
  const response = await authFetch('/api/chats/allChatsNames');
  if (!response.ok) throw new Error('Failed to fetch chats');
  return response.json();
};


export const updateChatName = async (
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  chatId: string,
  newName: string
): Promise<void> => {
  const response = await authFetch(`/api/chats/changeChatName/${chatId}`, {
    method: 'PUT',
    body: JSON.stringify({ newName }),
  });
  if (!response.ok) throw new Error('Failed to update chat name');
};


export const deleteChat = async (
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  chatId: string
): Promise<void> => {
  const response = await authFetch(`/api/chats/${chatId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete chat');
};


export const fetchMessages = async (
  authFetch: (url: string, options?: RequestInit) => Promise<Response>,
  chatId: string
): Promise<Message[]> => {
  const response = await authFetch(`/api/chats/messagesFromChat/${chatId}`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  return data.messages || [];
};
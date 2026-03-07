export interface StreamMessageTask {
  taskId: string;
  type: 'process_message';
  userId: string;
  chatId: string;
  messageText: string;
  socketId: string;
  createdAt: string;
  sessionId: string;
}

export interface ProcessedMessageResult {
  taskId: string;
  type: 'message_processed';
  success: boolean;
  aiResponse?: string;
  error?: string;
  chatId?: string;
  socketId: string;
}
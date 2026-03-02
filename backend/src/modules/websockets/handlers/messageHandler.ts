import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import { redis, pubClient } from '@/config/redis';
import { Chat, Message } from '@/modules/chats/index';
import { sendToN8n } from '../services/n8nService';
import { StreamMessageTask, ProcessedMessageResult } from '../types/streamTypes';
import { notifyClient } from '../services/notificationService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function handleIncomingMessage(
  ws: WebSocket,
  rawData: Buffer,
  userId: string,
  connectionId: string
) {
  const taskId = uuidv4();

  try {
    const messageData = JSON.parse(rawData.toString());

    let chatId: string;
    let chatSessionId: string;

    if (!messageData.chatId) {
      const newChat = await Chat.create({
        userId: userId,
        name: messageData.text?.substring(0, 50) || 'Новый чат',
        sessionId: uuidv4(),
        userMessagesCount: 0,
        isOver: false
      });

      chatId = newChat._id.toString();
      chatSessionId = newChat.sessionId;

      ws.send(JSON.stringify({
        type: 'chat_created',
        chatId: chatId,
        chatName: newChat.name,
        sessionId: chatSessionId,
        taskId
      }));
    } else {
      chatId = messageData.chatId;
      const existingChat = await Chat.findOne({ _id: chatId, userId: userId });

      if (!existingChat) {
        throw new Error('Чат не найден или у вас нет доступа');
      }

      chatSessionId = existingChat.sessionId;

      if (existingChat.isOver) {
        ws.send(JSON.stringify({
          type: 'error',
          text: 'Этот чат завершен. Создайте новый.',
          taskId
        }));
        return;
      }
    }

    if (!messageData.text || messageData.text.trim() === '') {
      ws.send(JSON.stringify({
        type: 'error',
        text: 'Сообщение не может быть пустым',
        taskId
      }));
      return;
    }

    const userMessage = await Message.create({
      chatId: chatId,
      text: messageData.text,
      isUserMessage: true,
      userId: userId
    });

    await Chat.findByIdAndUpdate(chatId, {
      $inc: { userMessagesCount: 1 }
    });

    const n8nJwt = jwt.sign(
      {
        userId,
        chatId,
        sessionId: chatSessionId,
        taskId
      },
      JWT_SECRET,
      { expiresIn: '5m' }
    );

    const streamTask: StreamMessageTask = {
      taskId,
      type: 'process_message',
      userId,
      chatId,
      sessionId: chatSessionId,
      messageText: messageData.text,
      socketId: connectionId,
      createdAt: new Date().toISOString()
    };

    await redis.xadd(
      'message:stream',
      '*',
      'task',
      JSON.stringify(streamTask),
      'jwt',
      n8nJwt
    );

    console.log(`Task ${taskId} added to Redis Stream for chat ${chatId}`);

    ws.send(JSON.stringify({
      type: 'message_received',
      messageId: userMessage._id,
      chatId: chatId,
      taskId
    }));

  } catch (error: unknown) {
    console.error('Error processing message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    ws.send(JSON.stringify({
      type: 'error',
      text: errorMessage,
      taskId
    }));
  }
}
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import { verifyAccessToken } from '@/core/utils/tokenUtils';
import { subClient } from '@/config/redis';
import { connectionHandler } from './handlers/connectionHandler';
import { notifyClient } from './services/notificationService';
import { startMessageProcessingWorker } from './workers/messageWorker';
import { ProcessedMessageResult } from './types/streamTypes';


export const activeConnections = new Map<string, WebSocket>();


export function setupWebSocketServer(httpServer: http.Server) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', async (request: http.IncomingMessage & { user?: any }, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const { user, expired } = await verifyAccessToken(token);

      if (expired || !user) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      request.user = user;
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });

    } catch (error) {
      console.error('Upgrade error:', error);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    }
  });


  subClient.subscribe('message:processed')
    .then((count) => {
      console.log(`Subscribed to ${count} Redis channels`);
    })
    .catch((err) => {
      console.error('Failed to subscribe to Redis channels:', err);
    });


  subClient.on('message', (channel: string, message: string) => {
    try {
      if (channel === 'message:processed') {
        const result: ProcessedMessageResult = JSON.parse(message);
        notifyClient(result.taskId, {
          type: result.success ? 'ai_message' : 'error',
          text: result.success ? result.aiResponse : result.error,
          taskId: result.taskId,
          chatId: result.chatId,
        });
      }
    } catch (error) {
      console.error('Error processing Redis message:', error);
    }
  });


  wss.on('connection', connectionHandler);

  startMessageProcessingWorker();

  return wss;
}
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';

import { handleIncomingMessage } from './messageHandler';
import { activeConnections } from '../socketServer';

export function connectionHandler(ws: WebSocket, request: IncomingMessage & { user?: any }) {
  const userId = request.user?._id?.toString();
  if (!userId) {
    ws.close(1008, 'User not identified');
    return;
  }

  const connectionId = uuidv4();
  activeConnections.set(connectionId, ws);
  console.log(`New WS connection: ${connectionId} for user: ${userId}`);

  ws.on('message', async (data: Buffer) => {
    await handleIncomingMessage(ws, data, userId, connectionId);
  });

  ws.on('close', () => {
    activeConnections.delete(connectionId);
    console.log(`Connection closed: ${connectionId}`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for connection ${connectionId}:`, error);
    activeConnections.delete(connectionId);
  });
}
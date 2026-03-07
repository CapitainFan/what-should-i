import { WebSocket } from 'ws';

import { activeConnections } from '../socketServer';


export function notifyClient(socketId: string, data: any) {
  const ws = activeConnections.get(socketId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}
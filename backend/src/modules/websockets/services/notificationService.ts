import { WebSocket } from 'ws';

import { activeConnections } from '../socketServer';


export function notifyClient(taskId: string, data: any) {
  const ws = activeConnections.get(taskId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}
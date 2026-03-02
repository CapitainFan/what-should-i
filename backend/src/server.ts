import http from 'http';
import app from './app';
import connectDB from './config/db';
import { setupWebSocketServer } from '@/modules/websockets/index';

const PORT = process.env.PORT || 3000;

connectDB();

const server = http.createServer(app);

setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту: ${PORT}`);
});
import http from 'http';
import { WebSocket, WebSocketServer } from "ws";
import { verifyAccessToken } from '../utils/tokenUtils';
import Message from '../models/messageModel';
import Chat from '../models/chatModel';
import User from '../models/userModel';
import { redis, pubClient, subClient } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedRequest extends http.IncomingMessage {
    user?: InstanceType<typeof User> & { _id: any };
}

interface StreamMessageTask {
    taskId: string;
    type: 'process_message';
    userId: string;
    chatId: string;
    messageText: string;
    socketId?: string;
    createdAt: string;
    sessionId: string;
}

interface ProcessedMessageResult {
    taskId: string;
    type: 'message_processed';
    success: boolean;
    aiResponse?: string;
    error?: string;
}

type RedisStreamMessage = [string, string[]];
type RedisStreamResult = [string, RedisStreamMessage[]] | null;

export function setupWebSocketServer(httpServer: http.Server) {
    const wss = new WebSocketServer({ noServer: true });
    const activeConnections = new Map<string, WebSocket>();

    httpServer.on('upgrade', async (request: AuthenticatedRequest, socket, head) => {
        try {
            const url = new URL(request.url || '', `http://${request.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            const { user, expired } = await verifyAccessToken(token as string);

            if (expired || !user) {
                socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                socket.destroy();
                return;
            }

            request.user = user;
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } catch (error: unknown) {
            console.error('Upgrade error:', error);
            socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
            socket.destroy();
        }
    });

    subClient.subscribe('message:processed')
        .then((count) => {
            console.log(`Subscribed to ${count} Redis channels`);
        })
        .catch((err: Error) => {
            console.error('Failed to subscribe to Redis channels:', err);
        });

    subClient.on('message', (channel: string, message: string) => {
        try {
            if (channel === 'message:processed') {
                const result: ProcessedMessageResult = JSON.parse(message);
                const ws = activeConnections.get(result.taskId);

                if (ws && ws.readyState === WebSocket.OPEN) {
                    if (result.success && result.aiResponse) {
                        ws.send(JSON.stringify({
                            type: 'ai_message',
                            text: result.aiResponse,
                            taskId: result.taskId
                        }));
                    } else if (result.error) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            text: result.error,
                            taskId: result.taskId
                        }));
                    }
                }
            }
        } catch (error: unknown) {
            console.error('Error processing Redis message:', error);
        }
    });

    wss.on('connection', (ws: WebSocket, request: AuthenticatedRequest) => {
        const userId = request.user?._id?.toString();
        if (!userId) {
            ws.close(1008, 'User not identified');
            return;
        }

        const connectionId = uuidv4();
        activeConnections.set(connectionId, ws);
        console.log(`New WS connection: ${connectionId} for user: ${userId}`);

        ws.on('message', async (data: Buffer) => {
            const taskId = uuidv4();
            activeConnections.set(taskId, ws);

            try {
                const messageData = JSON.parse(data.toString());
                
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
                        chatId: chatId, 
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
                    chatId: chatId,
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
        });

        ws.on('close', () => {
            activeConnections.delete(connectionId);
            console.log(`Connection closed: ${connectionId}`);
        });

        ws.on('error', (error: Error) => {
            console.error(`WebSocket error for connection ${connectionId}:`, error);
            activeConnections.delete(connectionId);
        });
    });

    startMessageProcessingWorker();
    return wss;
}

async function startMessageProcessingWorker() {
    console.log('Starting message processing worker...');
    const groupName = 'message_workers';
    const consumerName = `worker_${uuidv4()}`;

    try {
        try {
            await redis.xgroup('CREATE', 'message:stream', groupName, '0', 'MKSTREAM');
        } catch (err: unknown) {
            if (err instanceof Error && !err.message.includes('BUSYGROUP')) {
                throw err;
            }
        }

        while (true) {
            try {
                const result = await redis.xreadgroup(
                    'GROUP', groupName, consumerName,
                    'COUNT', '1', 'BLOCK', 5000,
                    'STREAMS', 'message:stream', '>'
                ) as RedisStreamResult[] | null;

                if (!result || result.length === 0) continue;

                const streamData = result[0];
                if (!streamData) continue;

                const [, messages] = streamData;
                
                for (const [messageId, fields] of messages) {
                    const fieldsArray = Array.isArray(fields) ? fields : [];
                    const taskIndex = fieldsArray.indexOf('task');
                    const jwtIndex = fieldsArray.indexOf('jwt');

                    if (taskIndex === -1 || jwtIndex === -1) continue;

                    const task: StreamMessageTask = JSON.parse(fieldsArray[taskIndex + 1]);
                    const n8nJwt = fieldsArray[jwtIndex + 1];

                    console.log(`Processing task ${task.taskId} from stream`);

                    try {
                        const aiResponse = await sendToN8n({
                            message: task.messageText,
                            chatId: task.chatId,
                            userId: task.userId,
                            taskId: task.taskId,
                            sessionId: task.sessionId,
                            jwt: n8nJwt
                        });

                        console.log('AI Response:', aiResponse);

                        const aiMessage = await Message.create({
                            chatId: task.chatId,
                            text: aiResponse,
                            isUserMessage: false
                        });

                        const processResult: ProcessedMessageResult = {
                            taskId: task.taskId,
                            type: 'message_processed',
                            success: true,
                            aiResponse
                        };

                        await pubClient.publish('message:processed', JSON.stringify(processResult));
                        await redis.xack('message:stream', groupName, messageId);

                    } catch (error: unknown) {
                        console.error(`Error processing task ${task.taskId}:`, error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        
                        const errorResult: ProcessedMessageResult = {
                            taskId: task.taskId,
                            type: 'message_processed',
                            success: false,
                            error: errorMessage
                        };

                        await pubClient.publish('message:processed', JSON.stringify(errorResult));
                    }
                }
            } catch (error: unknown) {
                console.error('Worker error:', error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    } catch (error: unknown) {
        console.error('Failed to start worker:', error);
    }
}

async function sendToN8n(params: {
    message: string;
    chatId: string;
    userId: string;
    taskId: string;
    jwt: string;
    sessionId: string;
}): Promise<string> {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL_PROD || 'https://your-n8n.com/webhook/ai-chat';

    const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.jwt}`,
            'X-Task-ID': params.taskId,
        },
        body: JSON.stringify({
            message: params.message,
            chatId: params.chatId,
            userId: params.userId,
            taskId: params.taskId,
            sessionId: params.sessionId,
        })
    });

    if (!response.ok) {
        throw new Error(`N8N request failed: ${response.statusText}`);
    }

    const aiResponse: string = JSON.parse(await response.text())?.output;;

    return aiResponse;
}
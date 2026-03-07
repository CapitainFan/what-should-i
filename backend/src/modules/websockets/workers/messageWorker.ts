import { v4 as uuidv4 } from 'uuid';

import { redis, pubClient } from '@/config/redis';
import { Message } from '@/modules/chats/index';
import { sendToN8n } from '../services/n8nService';
import { StreamMessageTask, ProcessedMessageResult } from '../types/streamTypes';


type RedisStreamResult = [string, [string, string[]][]] | null;


export async function startMessageProcessingWorker() {
  console.log('Starting message processing worker...');
  const groupName = 'message_workers';
  const consumerName = `worker_${uuidv4()}`;

  try {
    try {
      await redis.xgroup('CREATE', 'message:stream', groupName, '0', 'MKSTREAM');
    } catch (err: any) {
      if (!err.message.includes('BUSYGROUP')) {
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

            await Message.create({
              chatId: task.chatId,
              text: aiResponse,
              isUserMessage: false
            });

            const processResult: ProcessedMessageResult = {
              taskId: task.taskId,
              type: 'message_processed',
              success: true,
              chatId: task.chatId,
              aiResponse,
              socketId: task.socketId,
            };

            await pubClient.publish('message:processed', JSON.stringify(processResult));
            await redis.xack('message:stream', groupName, messageId);

          } catch (error: any) {
            console.error(`Error processing task ${task.taskId}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            const errorResult: ProcessedMessageResult = {
              taskId: task.taskId,
              type: 'message_processed',
              success: false,
              chatId: task.chatId,
              error: errorMessage,
              socketId: task.socketId,
            };

            await pubClient.publish('message:processed', JSON.stringify(errorResult));
          }
        }
      } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (!errorMessage.includes('Command timed out') && !errorMessage.includes('ioredis')) {
          console.error('Worker error:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error('Failed to start worker:', error);
  }
}
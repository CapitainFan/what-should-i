import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = 'redis://127.0.0.1:6379/1';
console.log(`Connecting to Redis at: ${REDIS_URL}`);

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 5,
  connectTimeout: 10000,
  commandTimeout: 5000,
  enableOfflineQueue: true,
  retryStrategy: (times) => Math.min(times * 500, 10000),
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('ready', () => console.log('Redis ready'));
redis.on('error', (err) => {
  if (!err.message.includes('Command timed out')) {
    console.error('Redis error:', err);
  }
});


export const pubClient = redis.duplicate();
export const subClient = redis.duplicate();
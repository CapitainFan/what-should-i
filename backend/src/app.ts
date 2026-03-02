import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { tokenRouter } from '@/modules/tokens/index';
import { userRouter } from '@/modules/users/index';
import { chatRouter } from '@/modules/chats/index';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/media', express.static(path.join(__dirname, '../media')));

app.get('/api', (req, res) => {
  res.send('Добро пожаловать в Express + TypeScript API');
});

app.use('/api/users', userRouter);
app.use('/api/tokens', tokenRouter);
app.use('/api/chats', chatRouter);

export default app;
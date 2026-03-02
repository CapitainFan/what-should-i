import express from 'express';

import { authenticate } from '@/core/middleware/authMiddleware';
import {
    getAllChatsNames,
    beginNewChat,
    changeChatName,
    deleteChat,
} from '../controllers/chatController';
import {
    getMessagesFromChat
} from '../controllers/messageController';


const router = express.Router();

router
    .get('/messagesFromChat/:chatId', authenticate, getMessagesFromChat)
    .get('/allChatsNames', authenticate, getAllChatsNames)
    .post('/beginNewChat', authenticate, beginNewChat)
    .put('/changeChatName/:chatId', authenticate, changeChatName)
    .delete('/:chatId', authenticate, deleteChat);


export default router;
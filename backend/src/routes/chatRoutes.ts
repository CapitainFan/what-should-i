import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
    getMessagesFromChat,
    getAllChatsNames,
    beginNewChat,
    changeChatName,
    deleteChat,
} from '../controllers/chatController';

const router = express.Router();

router
    .get('/messagesFromChat/:chatId', authenticate, getMessagesFromChat)
    .get('/allChatsNames', authenticate, getAllChatsNames)
    .post('/beginNewChat', authenticate, beginNewChat)
    .put('/changeChatName/:chatId', authenticate, changeChatName)
    .delete('/:chatId', authenticate, deleteChat);



export default router;
import { Request, Response } from 'express';

import asyncHandler from '@/core/middleware/asyncHandler';
import Chat from '../models/chatModel';
import Message  from "../models/messageModel";


export const getMessagesFromChat = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: 'Chat with this does not exist' });
    };

    const messages = await Message.find({chatId: chatId});

    return res.status(200).json({messages});
});
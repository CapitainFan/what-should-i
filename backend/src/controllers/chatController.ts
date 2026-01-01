import asyncHandler from '../middleware/asyncHandler';
import { Request, Response } from 'express';
import User from '../models/userModel';
import Chat, {TypeChat} from '../models/chatModel';
import Message  from "../models/messageModel";
import { v4 as uuidv4 } from 'uuid';


interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
    };
}


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



export const getAllChatsNames = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = (req as any).user;
    if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
    };

    const chats = await Chat
            .find({ userId: req.user?._id })
            .select('_id name')
            .lean();

    res.status(200).json(chats);
});



export const changeChatName = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
    };

    const { chatId } = req.params;
    const { newName } = req.body;

    if (!newName || typeof newName !== 'string' || newName.trim() === '') {
        return res.status(400).json({ message: 'Valid new name is required' });
    }

    try {
        const chat = await Chat.findOne({ _id: chatId, userId: user._id });

        if (!chat) {
            return res.status(404).json({ 
                message: 'Chat not found or you do not have permission to edit this chat' 
            });
        }

        const result = await Chat.findByIdAndUpdate(
            chatId, 
            { name: newName.trim() },
            { new: true }
        );

        if (!result) {
            return res.status(500).json({ 
                message: 'Failed to update chat name' 
            });
        };

        res.status(200).json({ 
            message: `Successfully updated chat name to "${newName}"`,
            updatedChat: {
                id: result._id,
                name: result.name
            }
        });

    } catch (error) {
        console.error('Error updating chat name:', error);

        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
});



export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
    };

    const { chatId } = req.params;

    try {
        const chat = await Chat.findOne({ _id: chatId, userId: user._id });

        if (!chat) {
            return res.status(404).json({ 
                message: 'Chat not found or you do not have permission to edit this chat' 
            });
        }

        const result = await Chat.findByIdAndDelete(
            chatId,
        );

        if (!result) {
            return res.status(500).json({ 
                message: 'Failed to delete chat' 
            });
        }

        res.status(200).json({ 
            message: `Successfully deleted chat with id ${chatId}`,
        });

    } catch (error) {
        console.error('Error deleting chat :', error);

        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
});


export const beginNewChat = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const { initialMessage, chatName } = req.body;
        
        const chat = await Chat.create({
            userId: user._id,
            name: chatName || (initialMessage ? initialMessage.substring(0, 50) : 'Новый чат'),
            sessionId: uuidv4(),
            userMessagesCount: 0,
            isOver: false
        });

        let firstMessage = null;
        if (initialMessage && initialMessage.trim() !== '') {
            firstMessage = await Message.create({
                chatId: chat._id,
                text: initialMessage,
                isUserMessage: true,
                userId: user._id
            });
            
            chat.userMessagesCount = 1;
            await chat.save();
        }

        res.status(201).json({
            chatId: chat._id,
            sessionId: chat.sessionId,
            name: chat.name,
            createdAt: chat.createdAt,
            firstMessage: firstMessage ? {
                id: firstMessage._id,
                text: firstMessage.text
            } : null
        });

    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
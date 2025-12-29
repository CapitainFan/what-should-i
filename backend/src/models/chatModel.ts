import mongoose, { Document, Schema } from "mongoose";
import { Types } from 'mongoose'

interface TypeChat extends Document{
    _id : Types.ObjectId;
    name : string;
    userId: Types.ObjectId;
    sessionId: string;
    userMessagesCount: number;
    isOver: boolean;
    createdAt: Date;
}

const chatSchema = new Schema<TypeChat>({
    userId : { type: Schema.Types.ObjectId, ref: "User", required: true},
    name: { type: Schema.Types.String, default: "Новый Чат"},
    sessionId: {type: Schema.Types.String, required: true},
    userMessagesCount: {type: Schema.Types.Number, default: 0},
    isOver: {type: Schema.Types.Boolean, default: false},
    createdAt: { type: Date, default: Date.now, index: true},
})

const Chat = mongoose.model<TypeChat>('Chat', chatSchema);
export default Chat;
export { TypeChat };
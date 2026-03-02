import mongoose, { Document, Schema } from "mongoose";
import { Types } from 'mongoose'

interface TypeMessage extends Document {
    _id: Types.ObjectId;
    chatId: Types.ObjectId;
    text: String;
    isUserMessage : Boolean;
    userId : Types.ObjectId;
    createdAt: Date;
}

const messageSchema = new Schema<TypeMessage>({
    chatId: { type: Schema.Types.ObjectId,  ref: 'Chat', required: true,},
    text: { type: String, maxlength: 50000, default: null, required: true},
    isUserMessage: { type: Boolean, required: true },
    userId : { type: Schema.Types.ObjectId, ref: "User", required: false},
    createdAt: { type: Date, default: Date.now, index: true},
});


const Message = mongoose.model<TypeMessage>('Message', messageSchema);
export default Message;
export { TypeMessage };
import mongoose, { Document, Schema, Types } from 'mongoose';


interface TypeRefreshToken extends Document {
  _id: Types.ObjectId;
  token: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema<TypeRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now, index: true},
  expiresAt: {
    type: Date,
    required: true
  }
});


refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });

const RefreshToken =  mongoose.model<TypeRefreshToken>('RefreshToken', refreshTokenSchema);
export default RefreshToken;
export { TypeRefreshToken };
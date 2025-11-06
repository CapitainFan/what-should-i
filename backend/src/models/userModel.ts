import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose'


interface TypeUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  createdAt: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
}


const userSchema = new Schema<TypeUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String , default: null},
  createdAt: { type: Date, default: Date.now, index: true},
});



userSchema.pre<TypeUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model<TypeUser>('User', userSchema);
export default User;
export { TypeUser };
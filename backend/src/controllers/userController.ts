import path from 'path';
import { Request, Response } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import User, { TypeUser } from '../models/userModel';
import {generateTokens, removeRefreshToken, setRefreshTokenCookie} from '../utils/tokenUtils';
import mongoose, { Types } from 'mongoose';
import { uploadFile, generateFileName, deleteFileFromSubdir } from '../services/s3Service';


interface AuthenticatedRequest extends Request {
  user?: {
    _id: Types.ObjectId;
  };
}


const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Неверный email или пароль');
  }

  const { accessToken, refreshToken } = await generateTokens(user._id.toString());
  
  setRefreshTokenCookie(res, refreshToken);

  const { password: _, ...userResponse } = user.toObject();
  res.status(200).json({
    ...userResponse,
    accessToken,
    refreshToken
  });
});



const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await removeRefreshToken(refreshToken);
  }

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({ message: "Logged out successfully" });
});



const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password ) {
    res.status(400);
    throw new Error('Заполните все поля');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Пользователь уже существует');
  }

  const user = await User.create({ username, email, password});
  
  res.status(201).json(user);
});




const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}, '-password -__v').lean();
  const totalUsers = await User.countDocuments({});

  res.status(200).json({count: totalUsers, users});
});



const getSpecificUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userId, '-password -__v')
  res.status(200).json({user});
});



const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = (req as any).user as TypeUser;

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    await User.deleteOne({ _id: user._id }).session(session);

    res.status(200).json({ 
      success: true,
      user,
      message: `user ${user._id} is deleted`
    });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
})




const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = (req as any).user as TypeUser;
  const {username, email, password } = req.body || null;
  const profilePicture = req.file as Express.Multer.File;

  if (!username && !email && !password && !profilePicture) {
    res.status(403);
    throw new Error('Вы не передали информации для обновления');
  }

  let profilePictureUrl

  if (profilePicture) {
    const ext = path.extname(profilePicture.originalname);
    const fileName = `${generateFileName()}${ext}`;
          
    const fileUrl = await uploadFile(
      profilePicture.buffer,
      fileName,
      profilePicture.mimetype,
      req,
      'users'
    );
    profilePictureUrl = fileUrl

    if (user.profilePicture) {
      const fileName = user.profilePicture.split('/').pop();
      if (fileName) {
        await deleteFileFromSubdir(fileName, 'users');
      }
    }
  }

  user.profilePicture = profilePictureUrl ?? user.profilePicture
  user.username = username ?? user.username
  user.email = email ?? user.email

  if (password) {
    user.password = password
  }

  await user.save()

  res.status(200).json({ 
    success: true, 
    message: `user ${user._id} is updated`
  });
})



export {
  registerUser,
  getUsers,
  getSpecificUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
};
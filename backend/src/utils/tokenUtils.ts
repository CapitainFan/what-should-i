import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import RefreshToken from '../models/refreshTokenModel';
import mongoose from 'mongoose';


const MAX_ACTIVE_SESSIONS = 3
const ACCESS_TOKEN_EXPIRES_IN = '15min'
const REFRESH_TOKEN_EXPIRES_IN = '30d'


export const generateTokens = async (userId: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const activeSessions = await RefreshToken.countDocuments({ userId });
  
    if (activeSessions >= MAX_ACTIVE_SESSIONS) {
      const oldestSessions = await RefreshToken.find({ userId })
        .sort({ createdAt: 1 })
        .limit(activeSessions - MAX_ACTIVE_SESSIONS + 1);

      for (const session of oldestSessions) {
        await RefreshToken.deleteOne({ _id: session._id });
      }
    }

    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      token: refreshToken,
      userId,
      expiresAt
    });

    await session.commitTransaction();
    return { accessToken, refreshToken };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


export const verifyAccessToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string; exp: number };
    
    if (Date.now() >= decoded.exp * 1000) {
      return { user: null, expired: true };
    }
    
    const user = await User.findById(decoded.userId).select("-password");
    return { user, expired: false };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { user: null, expired: true };
    }
    return { user: null, expired: false };
  }
};



export const verifyRefreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { userId: string; exp: number };
    
    if (Date.now() >= decoded.exp * 1000) {
      return { user: null, expired: true };
    }
    
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken || storedToken.userId.toString() !== decoded.userId) {
      return { user: null, expired: false };
    }

    const user = await User.findById(decoded.userId).select("-password");
    return { user, expired: false };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { user: null, expired: true };
    }
    return { user: null, expired: false };
  }
};




export const setRefreshTokenCookie = async (res: Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
  });
};


// export const setAccessTokenCookie = async (res: Response, accessToken: string) => {
//   res.cookie('accessToken', accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV !== 'development',
//     sameSite: 'lax',
//     maxAge: 15 * 60 * 1000 // 15 минут
//   });
// };



export const removeRefreshToken = async (token: string) => {
  await RefreshToken.deleteOne({ token });
};


export const findRefreshToken = async (token: string) => {
  return await RefreshToken.findOne({ token });
};



export const refreshTokens = async (res: Response, oldRefreshToken: string) => {
  try {
    const storedToken = await findRefreshToken(oldRefreshToken);
    if (!storedToken) {
      return null;
    }

    const { user, expired } = await verifyRefreshToken(oldRefreshToken);
    if (expired || !user) {
      await removeRefreshToken(oldRefreshToken);
      return null;
    }

    await removeRefreshToken(oldRefreshToken);

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id.toString());
    
    setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken, user };
  } catch (error) {
    return null;
  }
};

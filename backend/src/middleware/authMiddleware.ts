import { Request, Response, NextFunction } from 'express';
import asyncHandler from './asyncHandler';
import { verifyAccessToken } from '../utils/tokenUtils';
import User from '../models/userModel';


export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  token = req.headers?.authorization?.split(' ')[1] || 
          req.cookies?.accessToken || 
          (req.headers.cookie?.includes('accessToken=') 
            ? req.headers.cookie.split('accessToken=')[1].split(';')[0] 
            : null);

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token.");
  }

  const { user, expired } = await verifyAccessToken(token);
  
  if (expired) {
    res.status(401);
    throw new Error("Access token expired. Please refresh your token.");
  }

  if (!user) {
    res.status(401);
    throw new Error("Not authorized, token failed.");
  }

  (req as any).user = user;

  await User.findByIdAndUpdate(user._id, {
    lastSeen: new Date(),
    isOnline: true
  });

  next();
});
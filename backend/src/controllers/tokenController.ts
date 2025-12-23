import { refreshTokens } from '../utils/tokenUtils';
import asyncHandler from '../middleware/asyncHandler';
import { Request, Response } from 'express';
import User from '../models/userModel';


export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const result = await refreshTokens(res, refreshToken);

    if (!result) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
      accessTokenExpiresIn: 900,  // 15m
    });
    console.log(`route: /tokens/refreshToken; status: 200; user: ${result.user}; accessToken: ${result.accessToken};`);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.log(`route: /tokens/refreshToken; status: 200`);
  }
});


export const verifyToken = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const currentUser = await User.findById(user._id).select('-password');

  res.status(200).json({
    user: currentUser,
    accessToken: req.headers.authorization?.split(' ')[1]
  });
  console.log(`route: /tokens/refreshToken; status: 200; user: ${currentUser}; accessToken: ${req.headers.authorization?.split(' ')[1]};`);
});
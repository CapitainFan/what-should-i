import { refreshTokens } from '../utils/tokenUtils';
import asyncHandler from '../middleware/asyncHandler';
import { Request, Response } from 'express';


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
      user: result.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
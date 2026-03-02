import express from 'express';

import { authenticate } from '@/core/middleware/authMiddleware'
import { refreshAccessToken, verifyToken } from "../controllers/tokenController"

const router = express.Router();

router.post('/refreshToken', refreshAccessToken);
router.get('/verify', authenticate, verifyToken);

export default router;
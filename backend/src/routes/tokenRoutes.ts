import express from 'express';
import { refreshAccessToken, verifyToken } from "../controllers/tokenController"
import { authenticate } from '../middleware/authMiddleware'

const router = express.Router();

router.post('/refreshToken', refreshAccessToken);
router.get('/verify', authenticate, verifyToken);

export default router;
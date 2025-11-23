import express from 'express';
import { refreshAccessToken } from "../controllers/tokenController"

const router = express.Router();

router.post('/refreshToken', refreshAccessToken);

export default router;
import { Router } from 'express';
import {
  registerUser,
  getUsers,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  getSpecificUser,
} from '../controllers/userController';
import { upload } from '../middleware/uploadMiddleware';
import { authenticate } from '../middleware/authMiddleware'


const router = Router();

router
  .route('/')
  .get(authenticate, getUsers)
  .delete(authenticate, deleteUser)
  .patch(authenticate, upload.single('profilePicture'), updateUser);


router.get('/:userId', getSpecificUser)

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticate, logoutUser);


export default router;
import { Router } from 'express';
import {
    postRegister,
    postLogin,
    postLogout,
    getCurrentUser,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', postRegister);
router.post('/login', postLogin);
router.post('/logout', postLogout);
router.get('/me', getCurrentUser);

export default router;

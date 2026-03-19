import { Router } from 'express';
import { getMyDeliveries, postDelivery } from '../controllers/delivery.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/my', requireAuth, getMyDeliveries);
router.post('/', requireAuth, postDelivery);

export default router;

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getNotifications,
  clearNotifications,
  markNotificationRead,
} from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.delete('/', clearNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;

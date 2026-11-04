import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getNotifications,
  clearNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.delete('/', clearNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

export default router;


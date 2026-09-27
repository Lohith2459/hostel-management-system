import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  getMyNotifications,
  markNotificationRead,
} from '../controllers/announcement.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateJWT, getAnnouncements);
router.post('/', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), createAnnouncement);
router.get('/notifications', authenticateJWT, getMyNotifications);
router.patch('/notifications/:id/read', authenticateJWT, markNotificationRead);

export default router;

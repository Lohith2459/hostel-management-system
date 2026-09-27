import { Router } from 'express';
import {
  getAllVisitors,
  checkInVisitor,
  checkOutVisitor,
} from '../controllers/visitor.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getAllVisitors);
router.post('/checkin', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), checkInVisitor);
router.patch('/:id/checkout', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), checkOutVisitor);

export default router;

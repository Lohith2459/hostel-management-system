import { Router } from 'express';
import {
  applyLeave,
  reviewLeave,
  getMyLeaves,
  getAllLeaves,
} from '../controllers/leave.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/my', authenticateJWT, requireRole(['STUDENT']), getMyLeaves);
router.get('/all', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getAllLeaves);
router.post('/apply', authenticateJWT, requireRole(['STUDENT']), applyLeave);
router.patch('/:id/review', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), reviewLeave);

export default router;

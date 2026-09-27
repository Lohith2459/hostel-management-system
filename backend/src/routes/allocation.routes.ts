import { Router } from 'express';
import {
  allocateRoom,
  vacateRoom,
  transferRoom,
  getMyAllocation,
  getAllAllocations,
} from '../controllers/allocation.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/my', authenticateJWT, requireRole(['STUDENT']), getMyAllocation);
router.get('/all', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getAllAllocations);
router.post('/allocate', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), allocateRoom);
router.post('/vacate', authenticateJWT, vacateRoom);
router.post('/transfer', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), transferRoom);

export default router;

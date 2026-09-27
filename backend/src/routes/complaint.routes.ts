import { Router } from 'express';
import {
  createComplaint,
  updateComplaintStatus,
  getMyComplaints,
  getAllComplaints,
} from '../controllers/complaint.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/my', authenticateJWT, requireRole(['STUDENT']), getMyComplaints);
router.get('/all', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getAllComplaints);
router.post('/', authenticateJWT, requireRole(['STUDENT']), createComplaint);
router.patch('/:id/status', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), updateComplaintStatus);

export default router;

import { Router } from 'express';
import {
  markAttendance,
  getMyAttendance,
  getHostelAttendance,
} from '../controllers/attendance.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/my', authenticateJWT, requireRole(['STUDENT']), getMyAttendance);
router.get('/hostel/:hostelId', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getHostelAttendance);
router.post('/mark', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), markAttendance);

export default router;

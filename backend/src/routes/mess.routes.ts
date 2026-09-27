import { Router } from 'express';
import {
  getMenu,
  updateMenuItem,
  getWastageLogs,
  logWastage,
  getPrediction,
} from '../controllers/mess.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/menu', authenticateJWT, getMenu);
router.patch('/menu/:id', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), updateMenuItem);
router.get('/wastage', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getWastageLogs);
router.post('/wastage', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), logWastage);
router.get('/prediction', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getPrediction);

export default router;

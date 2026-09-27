import { Router } from 'express';
import { getOverview, getHierarchy, createHostel } from '../controllers/hostel.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/overview', authenticateJWT, getOverview);
router.get('/:id/hierarchy', authenticateJWT, getHierarchy);
router.post('/', authenticateJWT, requireRole(['ADMIN']), createHostel);

export default router;

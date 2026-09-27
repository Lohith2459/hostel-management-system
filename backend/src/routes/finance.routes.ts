import { Router } from 'express';
import {
  getMyFees,
  getAllFees,
  getAllPayments,
  payFeeSimulation,
  getReceipt,
  verifyReceiptToken,
  getExpenses,
} from '../controllers/finance.controller.js';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/fees/my', authenticateJWT, requireRole(['STUDENT']), getMyFees);
router.get('/fees/all', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getAllFees);
router.get('/payments/all', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getAllPayments);
router.post('/pay/simulate', authenticateJWT, requireRole(['STUDENT']), payFeeSimulation);
router.get('/receipts/verify/:token', verifyReceiptToken); // Public QR verification endpoint
router.get('/receipts/:receiptNumber', authenticateJWT, getReceipt);
router.get('/expenses', authenticateJWT, requireRole(['ADMIN', 'WARDEN']), getExpenses);

export default router;

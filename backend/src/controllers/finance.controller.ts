import { Request, Response } from 'express';
import { financeService } from '../services/finance.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getMyFees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(403).json({
        success: false,
        message: 'No student profile associated with account',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    const data = await financeService.getStudentFees(studentId);
    res.status(200).json({
      success: true,
      message: 'Student fee schedule retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching fees',
      error: { code: err.code || 'FEES_FETCH_ERROR' },
    });
  }
};

export const getAllFees = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await financeService.getAllFees();
    res.status(200).json({
      success: true,
      message: 'All fees retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching fee records',
      error: { code: err.code || 'FEES_FETCH_ERROR' },
    });
  }
};

export const getAllPayments = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await financeService.getAllPayments();
    res.status(200).json({
      success: true,
      message: 'All payments retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching payments',
      error: { code: err.code || 'PAYMENTS_FETCH_ERROR' },
    });
  }
};

export const payFeeSimulation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(403).json({
        success: false,
        message: 'Only registered students can process fee payments',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    const data = await financeService.processSimulatedPayment({
      feeId: req.body.feeId,
      studentId,
      paymentMethod: req.body.paymentMethod || 'SIMULATION',
    });

    res.status(200).json({
      success: true,
      message: data.message,
      data: data.payment,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Payment simulation failed',
      error: { code: err.code || 'PAYMENT_FAILED' },
    });
  }
};

export const getReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiptNumber } = req.params;
    const data = await financeService.getOfficialReceipt(receiptNumber);
    res.status(200).json({
      success: true,
      message: 'Official verified receipt retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching official receipt',
      error: { code: err.code || 'RECEIPT_ERROR' },
    });
  }
};

export const verifyReceiptToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const data = await financeService.verifyToken(token);
    res.status(200).json({
      success: true,
      message: 'Token verification complete',
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error verifying receipt token',
      error: { code: 'VERIFICATION_ERROR' },
    });
  }
};

export const getExpenses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await financeService.getAllExpenses();
    res.status(200).json({
      success: true,
      message: 'Hostel expenses retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching expenses',
      error: { code: err.code || 'EXPENSES_ERROR' },
    });
  }
};

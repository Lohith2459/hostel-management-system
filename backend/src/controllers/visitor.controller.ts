import { Response } from 'express';
import { visitorService } from '../services/visitor.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const getAllVisitors = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await visitorService.getAll();
    res.status(200).json({
      success: true,
      message: 'Visitor logs retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching visitor logs',
      error: { code: err.code || 'VISITOR_FETCH_ERROR' },
    });
  }
};

export const checkInVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const approvedBy = req.user?.email || 'Warden';
    const data = await visitorService.checkIn({
      ...req.body,
      approvedBy,
    });
    res.status(201).json({
      success: true,
      message: 'Visitor checked in successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error registering visitor',
      error: { code: err.code || 'VISITOR_CHECKIN_ERROR' },
    });
  }
};

export const checkOutVisitor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await visitorService.checkOut(id);
    res.status(200).json({
      success: true,
      message: 'Visitor check-out recorded',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error checking out visitor',
      error: { code: err.code || 'VISITOR_CHECKOUT_ERROR' },
    });
  }
};

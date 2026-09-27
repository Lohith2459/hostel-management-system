import { Response } from 'express';
import { leaveService } from '../services/leave.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const applyLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(403).json({
        success: false,
        message: 'Only students can submit leave/outpass requests',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    const data = await leaveService.apply({
      ...req.body,
      studentId,
    });

    res.status(201).json({
      success: true,
      message: 'Leave/outpass request submitted for warden review',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error submitting leave request',
      error: { code: err.code || 'LEAVE_ERROR' },
    });
  }
};

export const reviewLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewer = req.user?.email || 'Warden';

    const data = await leaveService.review(id, status, reviewer, reviewNotes);
    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error updating leave request status',
      error: { code: err.code || 'LEAVE_REVIEW_ERROR' },
    });
  }
};

export const getMyLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized for this profile',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    const data = await leaveService.getStudentLeaves(studentId);
    res.status(200).json({
      success: true,
      message: 'Leave requests retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching leaves',
      error: { code: err.code || 'LEAVE_FETCH_ERROR' },
    });
  }
};

export const getAllLeaves = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await leaveService.getAllLeaves();
    res.status(200).json({
      success: true,
      message: 'All leave requests retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching leave requests',
      error: { code: err.code || 'LEAVES_FETCH_ERROR' },
    });
  }
};

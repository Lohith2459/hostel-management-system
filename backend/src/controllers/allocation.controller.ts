import { Response } from 'express';
import { allocationService } from '../services/allocation.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const allocateRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await allocationService.allocate(req.body);
    res.status(201).json({
      success: true,
      message: 'Room allocation completed successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error allocating room',
      error: { code: err.code || 'ALLOCATION_ERROR' },
    });
  }
};

export const vacateRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, notes } = req.body;
    // Students can vacate only their own room, Admins/Wardens can vacate any
    const targetStudentId = req.user?.role === 'STUDENT' ? req.user.studentId! : studentId;

    const data = await allocationService.vacate(targetStudentId, notes);
    res.status(200).json({
      success: true,
      message: data.message,
      data: data.allocation,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error vacating room',
      error: { code: err.code || 'VACATE_ERROR' },
    });
  }
};

export const transferRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await allocationService.transfer(req.body);
    res.status(200).json({
      success: true,
      message: 'Room transfer completed successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error transferring room',
      error: { code: err.code || 'TRANSFER_ERROR' },
    });
  }
};

export const getMyAllocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({
        success: false,
        message: 'No student profile linked to this account',
        error: { code: 'PROFILE_NOT_FOUND' },
      });
      return;
    }

    const data = await allocationService.getStudentAllocation(studentId);
    res.status(200).json({
      success: true,
      message: 'Active room allocation retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching room allocation',
      error: { code: err.code || 'ALLOCATION_FETCH_ERROR' },
    });
  }
};

export const getAllAllocations = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await allocationService.getAllAllocations();
    res.status(200).json({
      success: true,
      message: 'All allocations retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching allocations',
      error: { code: err.code || 'ALLOCATIONS_FETCH_ERROR' },
    });
  }
};

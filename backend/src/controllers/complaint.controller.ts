import { Response } from 'express';
import { complaintService } from '../services/complaint.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const createComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(403).json({
        success: false,
        message: 'Only registered students can log complaints',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    const data = await complaintService.createComplaint({
      ...req.body,
      studentId,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint ticket created successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error creating complaint',
      error: { code: err.code || 'COMPLAINT_CREATE_ERROR' },
    });
  }
};

export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const data = await complaintService.updateComplaintStatus(id, status, resolutionNotes);
    res.status(200).json({
      success: true,
      message: 'Complaint status updated',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error updating complaint',
      error: { code: err.code || 'COMPLAINT_UPDATE_ERROR' },
    });
  }
};

export const getMyComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(403).json({
        success: false,
        message: 'No student profile linked',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    const data = await complaintService.getStudentComplaints(studentId);
    res.status(200).json({
      success: true,
      message: 'Complaints list retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error retrieving complaints',
      error: { code: err.code || 'COMPLAINTS_FETCH_ERROR' },
    });
  }
};

export const getAllComplaints = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = await complaintService.getAllComplaints();
    res.status(200).json({
      success: true,
      message: 'All complaints retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error retrieving complaints',
      error: { code: err.code || 'COMPLAINTS_FETCH_ERROR' },
    });
  }
};

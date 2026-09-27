import { Response } from 'express';
import { attendanceService } from '../services/attendance.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const markAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    const markedBy = req.user?.email || 'System';
    const data = await attendanceService.markBatch(items, markedBy);
    res.status(200).json({
      success: true,
      message: 'Attendance logs recorded successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error recording attendance',
      error: { code: err.code || 'ATTENDANCE_ERROR' },
    });
  }
};

export const getMyAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({
        success: false,
        message: 'No student profile linked',
        error: { code: 'PROFILE_NOT_FOUND' },
      });
      return;
    }

    const data = await attendanceService.getStudentAttendance(studentId);
    res.status(200).json({
      success: true,
      message: 'Attendance records retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching attendance',
      error: { code: err.code || 'ATTENDANCE_FETCH_ERROR' },
    });
  }
};

export const getHostelAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hostelId } = req.params;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const data = await attendanceService.getHostelDailyAttendance(hostelId, date);
    res.status(200).json({
      success: true,
      message: 'Hostel daily attendance retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching daily attendance',
      error: { code: err.code || 'ATTENDANCE_FETCH_ERROR' },
    });
  }
};

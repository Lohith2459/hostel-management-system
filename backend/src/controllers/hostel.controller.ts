import { Request, Response } from 'express';
import { hostelService } from '../services/hostel.service.js';

export const getOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await hostelService.getHostelOverview();
    res.status(200).json({
      success: true,
      message: 'Hostel overview retrieved successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching hostel overview',
      error: { code: err.code || 'HOSTEL_ERROR' },
    });
  }
};

export const getHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await hostelService.getHostelHierarchy(id);
    res.status(200).json({
      success: true,
      message: 'Hostel hierarchy retrieved successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching hostel hierarchy',
      error: { code: err.code || 'HIERARCHY_ERROR' },
    });
  }
};

export const createHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await hostelService.createHostel(req.body);
    res.status(201).json({
      success: true,
      message: 'Hostel facility created successfully',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error creating hostel',
      error: { code: err.code || 'CREATE_HOSTEL_ERROR' },
    });
  }
};

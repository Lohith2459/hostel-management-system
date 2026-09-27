import { Request, Response } from 'express';
import { messService } from '../services/mess.service.js';

export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const hostelId = req.query.hostelId as string | undefined;
    const data = await messService.getMenu(hostelId);
    res.status(200).json({
      success: true,
      message: 'Weekly food menu retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching food menu',
      error: { code: err.code || 'MENU_FETCH_ERROR' },
    });
  }
};

export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { itemsDescription } = req.body;
    const data = await messService.updateMenuItem(id, itemsDescription);
    res.status(200).json({
      success: true,
      message: 'Menu item updated',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error updating menu',
      error: { code: err.code || 'MENU_UPDATE_ERROR' },
    });
  }
};

export const getWastageLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const hostelId = req.query.hostelId as string | undefined;
    const data = await messService.getWastageLogs(hostelId);
    res.status(200).json({
      success: true,
      message: 'Food wastage records retrieved',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error fetching wastage logs',
      error: { code: err.code || 'WASTAGE_FETCH_ERROR' },
    });
  }
};

export const logWastage = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await messService.logWastage(req.body);
    res.status(201).json({
      success: true,
      message: 'Food wastage record added',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error recording wastage',
      error: { code: err.code || 'WASTAGE_LOG_ERROR' },
    });
  }
};

export const getPrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const hostelId = req.query.hostelId as string | undefined;
    const data = await messService.getWastagePrediction(hostelId);
    res.status(200).json({
      success: true,
      message: 'Food wastage forecast and prep recommendations computed',
      data,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error calculating prediction',
      error: { code: err.code || 'PREDICTION_ERROR' },
    });
  }
};

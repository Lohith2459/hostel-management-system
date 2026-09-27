import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error creating account',
      error: { code: err.code || 'SIGNUP_ERROR' },
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Authentication failed',
      error: { code: err.code || 'AUTH_ERROR' },
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: { code: 'UNAUTHORIZED' },
      });
      return;
    }

    const result = await authService.getMe(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'Current user context retrieved',
      data: result,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error retrieving user context',
      error: { code: err.code || 'USER_ERROR' },
    });
  }
};

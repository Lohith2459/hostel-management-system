import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, Role } from '../types/index.js';
import { userRepository } from '../repositories/user.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hostelsphere-super-secure-production-jwt-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid',
      error: { code: 'UNAUTHORIZED' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Verify user is still active in database
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive, suspended, or does not exist',
        error: { code: 'USER_INACTIVE' },
      });
      return;
    }

    // Attach verified user context
    req.user = decoded;
    next();
  } catch (err: unknown) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token',
      error: { code: 'INVALID_TOKEN' },
    });
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: { code: 'UNAUTHORIZED' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    next();
  };
};

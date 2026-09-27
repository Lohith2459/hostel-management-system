import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation error: ' + issues.map((i) => i.message).join(', '),
          error: {
            code: 'VALIDATION_ERROR',
            details: issues,
          },
        });
        return;
      }
      next(err);
    }
  };
};

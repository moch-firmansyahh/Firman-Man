import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error Captured:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada internal server.';
  
  return sendError(res, message, statusCode);
};

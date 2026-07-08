import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Read token from cookie or Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return sendError(res, 'Akses ditolak. Silakan login terlebih dahulu.', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.', 401);
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
  };

  next();
};

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.registerUser(req.body);
    return sendSuccess(res, 'Registrasi berhasil.', user, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal mendaftarkan user.', 400);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.loginUser(req.body);
    const token = generateToken({ id: user.id, email: user.email });

    // Set cookie token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, 'Login berhasil.', { user });
  } catch (error: any) {
    return sendError(res, error.message || 'Login gagal.', 401);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return sendSuccess(res, 'Logout berhasil.');
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Sesi berakhir atau tidak valid.', 401);
    }
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return sendError(res, 'User tidak ditemukan.', 404);
    }
    return sendSuccess(res, 'Profile user berhasil diambil.', user);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal mengambil data user.', 500);
  }
};

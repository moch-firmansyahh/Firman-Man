import { Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, category } = req.query;

    const transactions = await transactionService.getTransactions(userId, {
      startDate: startDate as string,
      endDate: endDate as string,
      category: category as string,
    });

    return sendSuccess(res, 'Daftar transaksi berhasil diambil.', transactions);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal mengambil data transaksi.', 500);
  }
};

export const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const transaction = await transactionService.createTransaction(userId, req.body);
    return sendSuccess(res, 'Transaksi berhasil ditambahkan.', transaction, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal menambahkan transaksi.', 400);
  }
};

export const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const transaction = await transactionService.updateTransaction(id, userId, req.body);
    return sendSuccess(res, 'Transaksi berhasil diperbarui.', transaction);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal memperbarui transaksi.', 400);
  }
};

export const remove = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await transactionService.deleteTransaction(id, userId);
    return sendSuccess(res, 'Transaksi berhasil dihapus.');
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal menghapus transaksi.', 400);
  }
};

export const summary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const summaryData = await transactionService.getFinanceSummary(userId);
    return sendSuccess(res, 'Ringkasan keuangan berhasil diambil.', summaryData);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal mengambil ringkasan keuangan.', 500);
  }
};

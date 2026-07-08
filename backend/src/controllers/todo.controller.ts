import { Response, NextFunction } from 'express';
import * as todoService from '../services/todo.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status, priority, category } = req.query;

    const todos = await todoService.getTodos(userId, {
      status: status as string,
      priority: priority as string,
      category: category as string,
    });

    return sendSuccess(res, 'Daftar todo berhasil diambil.', todos);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal mengambil data todo.', 500);
  }
};

export const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const todo = await todoService.createTodo(userId, req.body);
    return sendSuccess(res, 'Todo berhasil ditambahkan.', todo, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal menambahkan todo.', 400);
  }
};

export const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const todo = await todoService.updateTodo(id, userId, req.body);
    return sendSuccess(res, 'Todo berhasil diperbarui.', todo);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal memperbarui todo.', 400);
  }
};

export const updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;
    const todo = await todoService.updateTodoStatus(id, userId, status);
    return sendSuccess(res, 'Status todo berhasil diperbarui.', todo);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal memperbarui status todo.', 400);
  }
};

export const remove = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await todoService.deleteTodo(id, userId);
    return sendSuccess(res, 'Todo berhasil dihapus.');
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal menghapus todo.', 400);
  }
};

export const summary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const summaryData = await todoService.getTodosSummary(userId);
    return sendSuccess(res, 'Ringkasan todo berhasil diambil.', summaryData);
  } catch (error: any) {
    return sendError(res, error.message || 'Gagal mengambil ringkasan todo.', 500);
  }
};

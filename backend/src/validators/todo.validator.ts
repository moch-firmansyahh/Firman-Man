import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1, { message: 'Judul todo tidak boleh kosong.' }),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: "Prioritas harus 'low', 'medium', atau 'high'." }),
  }),
  status: z.enum(['pending', 'in_progress', 'completed'], {
    errorMap: () => ({ message: "Status harus 'pending', 'in_progress', atau 'completed'." }),
  }).default('pending'),
  category: z.string().min(1, { message: 'Kategori tidak boleh kosong.' }),
  deadline: z.coerce.date().optional().nullable(),
});

export const updateTodoStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed'], {
    errorMap: () => ({ message: "Status harus 'pending', 'in_progress', atau 'completed'." }),
  }),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoStatusInput = z.infer<typeof updateTodoStatusSchema>;

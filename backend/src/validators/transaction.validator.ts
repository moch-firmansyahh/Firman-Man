import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: "Tipe transaksi harus 'income' atau 'expense'." }),
  }),
  amount: z.number().int().positive({ message: 'Jumlah transaksi harus lebih besar dari 0.' }),
  category: z.string().min(1, { message: 'Kategori tidak boleh kosong.' }),
  note: z.string().max(255).optional().nullable(),
  date: z.coerce.date({ message: 'Format tanggal tidak valid.' }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

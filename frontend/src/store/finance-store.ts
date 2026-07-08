import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string | null;
  date: string;
  createdAt: string;
}

interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionsCount: number;
}

interface FinanceState {
  transactions: Transaction[];
  summary: FinanceSummary | null;
  loading: boolean;
  fetchTransactions: (filters?: { startDate?: string; endDate?: string; category?: string }) => Promise<void>;
  fetchSummary: () => Promise<void>;
  addTransaction: (data: any) => Promise<void>;
  editTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  summary: null,
  loading: false,

  fetchTransactions: async (filters = {}) => {
    set({ loading: true });
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.category) queryParams.append('category', filters.category);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await apiFetch(`/transactions${queryString}`);
      set({ transactions: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchSummary: async () => {
    try {
      const res = await apiFetch('/transactions/summary');
      set({ summary: res.data });
    } catch (error) {
      console.error('Fetch Summary Error:', error);
    }
  },

  addTransaction: async (data) => {
    set({ loading: true });
    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await get().fetchTransactions();
      await get().fetchSummary();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  editTransaction: async (id, data) => {
    set({ loading: true });
    try {
      await apiFetch(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await get().fetchTransactions();
      await get().fetchSummary();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true });
    try {
      await apiFetch(`/transactions/${id}`, {
        method: 'DELETE',
      });
      await get().fetchTransactions();
      await get().fetchSummary();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

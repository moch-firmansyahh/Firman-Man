import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export interface Todo {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  category: string;
  deadline: string | null;
  createdAt: string;
}

interface TodoSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  approachingDeadline: Todo[];
}

interface TodoState {
  todos: Todo[];
  summary: TodoSummary | null;
  loading: boolean;
  fetchTodos: (filters?: { status?: string; priority?: string; category?: string }) => Promise<void>;
  fetchSummary: () => Promise<void>;
  addTodo: (data: any) => Promise<void>;
  editTodo: (id: string, data: any) => Promise<void>;
  updateTodoStatus: (id: string, status: Todo['status']) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  summary: null,
  loading: false,

  fetchTodos: async (filters = {}) => {
    set({ loading: true });
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.category) queryParams.append('category', filters.category);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await apiFetch(`/todos${queryString}`);
      set({ todos: res.data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchSummary: async () => {
    try {
      const res = await apiFetch('/todos/summary');
      set({ summary: res.data });
    } catch (error) {
      console.error('Fetch Todo Summary Error:', error);
    }
  },

  addTodo: async (data) => {
    set({ loading: true });
    try {
      await apiFetch('/todos', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await get().fetchTodos();
      await get().fetchSummary();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  editTodo: async (id, data) => {
    set({ loading: true });
    try {
      await apiFetch(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      await get().fetchTodos();
      await get().fetchSummary();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateTodoStatus: async (id, status) => {
    // Optimistic update locally for smooth UI feedback, then sync to API
    const previousTodos = get().todos;
    set({
      todos: previousTodos.map((todo) =>
        todo.id === id ? { ...todo, status } : todo
      ),
    });

    try {
      await apiFetch(`/todos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await get().fetchSummary();
    } catch (error) {
      // rollback if failed
      set({ todos: previousTodos });
      throw error;
    }
  },

  deleteTodo: async (id) => {
    set({ loading: true });
    try {
      await apiFetch(`/todos/${id}`, {
        method: 'DELETE',
      });
      await get().fetchTodos();
      await get().fetchSummary();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

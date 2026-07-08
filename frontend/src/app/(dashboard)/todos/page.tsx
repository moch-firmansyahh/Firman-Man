'use client';

import { useEffect, useState } from 'react';
import { useTodoStore, Todo } from '@/store/todo-store';
import { CheckSquare, Plus, Trash2, Edit2, Calendar, Tag, AlertCircle, X, CheckCircle2, Circle, Clock, Filter } from 'lucide-react';

export default function TodosPage() {
  const {
    todos,
    summary,
    loading,
    fetchTodos,
    fetchSummary,
    addTodo,
    editTodo,
    updateTodoStatus,
    deleteTodo,
  } = useTodoStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [status, setStatus] = useState<Todo['status']>('pending');
  const [category, setCategory] = useState('Kuliah');
  const [deadline, setDeadline] = useState('');

  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = ['Kuliah', 'Tugas Besar', 'Personal Project', 'Pekerjaan Rumah', 'Lainnya'];

  useEffect(() => {
    fetchTodos();
    fetchSummary();
  }, [fetchTodos, fetchSummary]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTodos({
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
      category: filterCategory || undefined,
    });
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterCategory('');
    fetchTodos();
  };

  const handleOpenAdd = () => {
    setEditingTodo(null);
    setTitle('');
    setPriority('medium');
    setStatus('pending');
    setCategory('Kuliah');
    setDeadline('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setPriority(todo.priority);
    setStatus(todo.status);
    setCategory(todo.category);
    setDeadline(todo.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      priority,
      status,
      category,
      deadline: deadline ? new Date(deadline).toISOString() : null,
    };

    try {
      if (editingTodo) {
        await editTodo(editingTodo.id, payload);
      } else {
        await addTodo(payload);
      }
      setIsFormOpen(false);
    } catch (err) {
      alert('Gagal menyimpan tugas.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus tugas ini?')) {
      try {
        await deleteTodo(id);
      } catch (err) {
        alert('Gagal menghapus tugas.');
      }
    }
  };

  const toggleStatus = async (todo: Todo) => {
    const nextStatusMap: Record<Todo['status'], Todo['status']> = {
      'pending': 'in_progress',
      'in_progress': 'completed',
      'completed': 'pending',
    };
    const nextStatus = nextStatusMap[todo.status];
    try {
      await updateTodoStatus(todo.id, nextStatus);
    } catch (err) {
      alert('Gagal memperbarui status tugas.');
    }
  };

  const getPriorityStyle = (prio: Todo['priority']) => {
    switch (prio) {
      case 'high': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'low': return 'bg-zinc-800 text-zinc-400 border border-zinc-700/50';
    }
  };

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400 hover:scale-110 transition-transform cursor-pointer" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-amber-400 hover:scale-110 transition-transform cursor-pointer" />;
      default:
        return <Circle className="h-5 w-5 text-zinc-500 hover:scale-110 transition-transform cursor-pointer" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Daftar Tugas (To-Do List)</h2>
          <p className="text-sm text-zinc-400">Atur prioritas tugas kuliah dan personal project Anda secara terstruktur.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Tambah Tugas
        </button>
      </div>

      {/* Task Summary Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Tugas</p>
          <p className="text-xl font-bold mt-1 text-white">{summary?.total || 0}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Belum Dikerjakan</p>
          <p className="text-xl font-bold mt-1 text-zinc-400">{summary?.pending || 0}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Sedang Dikerjakan</p>
          <p className="text-xl font-bold mt-1 text-amber-400">{summary?.inProgress || 0}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Selesai</p>
          <p className="text-xl font-bold mt-1 text-emerald-400">{summary?.completed || 0}</p>
        </div>
      </div>

      {/* Main Grid: Filters & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Panel */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-zinc-800 pb-3">
            <Filter className="h-4.5 w-4.5 text-indigo-400" />
            Filter Tugas
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Semua Status</option>
                <option value="pending">Belum Dikerjakan</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="completed">Selesai</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Prioritas</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Semua Prioritas</option>
                <option value="high">Tinggi (High)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="low">Rendah (Low)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all"
              >
                Terapkan Filter
              </button>
              {(filterStatus || filterPriority || filterCategory) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full bg-transparent hover:bg-zinc-900 text-zinc-400 font-semibold py-2 px-4 rounded-xl text-xs border border-zinc-800 transition-all"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tasks List Container */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white">Daftar Kegiatan</h3>
            <span className="text-xs font-semibold text-zinc-500">{todos.length} Tugas</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-xs text-zinc-500">Memuat tugas-tugas...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-400">Tidak ada tugas ditemukan</p>
              <p className="text-xs text-zinc-500 mt-1">Silakan tambahkan tugas baru untuk mengawasi progres Anda.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-950/40 transition-all group ${
                    todo.status === 'completed' ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <button
                      onClick={() => toggleStatus(todo)}
                      className="shrink-0 focus:outline-none"
                      title="Klik untuk mengubah status"
                    >
                      {getStatusIcon(todo.status)}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <p className={`font-semibold text-sm text-zinc-200 truncate ${
                        todo.status === 'completed' ? 'line-through text-zinc-500' : ''
                      }`}>
                        {todo.title}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 items-center text-[10px] text-zinc-500">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getPriorityStyle(todo.priority)}`}>
                          {todo.priority}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {todo.category}
                        </span>

                        {todo.deadline && (
                          <span className={`flex items-center gap-1 font-medium ${
                            todo.status !== 'completed' && new Date(todo.deadline) < new Date()
                              ? 'text-rose-400 font-bold'
                              : 'text-zinc-500'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(todo.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            {todo.status !== 'completed' && new Date(todo.deadline) < new Date() && ' (Terlambat)'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleOpenEdit(todo)}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                      title="Ubah"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1.5 hover:bg-rose-950/30 text-zinc-500 hover:text-rose-400 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide / Popup Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

          <div className="relative w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl animate-scale-up space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTodo ? 'Ubah Tugas' : 'Tambah Tugas Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Misalnya: Mengerjakan tugas kalkulus bab 3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Todo['priority'])}
                    className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="low">Rendah (Low)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="high">Tinggi (High)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Deadline (Opsional)</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Status Pengerjaan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Todo['status'])}
                    className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="pending">Belum Dikerjakan</option>
                    <option value="in_progress">Sedang Dikerjakan</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 rounded-xl text-xs font-semibold transition-all"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-500/20"
                >
                  {editingTodo ? 'Perbarui' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

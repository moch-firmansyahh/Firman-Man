'use client';

import { useEffect, useState } from 'react';
import { useTodoStore, Todo } from '@/store/todo-store';
import { Plus, Trash2, Edit2, Calendar, Tag, X, CheckCircle2, Circle, Clock, Filter } from 'lucide-react';

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

  // Form inputs
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [status, setStatus] = useState<Todo['status']>('pending');
  const [category, setCategory] = useState('Kuliah');
  const [deadline, setDeadline] = useState('');

  // Filters
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
      case 'high': return 'bg-rose-955/20 text-rose-400 border border-rose-900/60';
      case 'medium': return 'bg-amber-955/20 text-amber-400 border border-amber-900/60';
      case 'low': return 'bg-zinc-900 text-zinc-400 border border-zinc-800';
    }
  };

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 cursor-pointer" />;
      case 'in_progress':
        return <Clock className="h-4.5 w-4.5 text-amber-400 cursor-pointer" />;
      default:
        return <Circle className="h-4.5 w-4.5 text-zinc-500 cursor-pointer" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Daftar Tugas (To-Do List)</h2>
          <p className="text-xs text-zinc-400">Atur prioritas tugas kuliah dan personal project Anda.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="shadcn-btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Tugas
        </button>
      </div>

      {/* Task Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="shadcn-card p-4 space-y-1">
          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total Tugas</p>
          <p className="text-lg font-bold text-white">{summary?.total || 0}</p>
        </div>
        <div className="shadcn-card p-4 space-y-1">
          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Belum Dikerjakan</p>
          <p className="text-lg font-bold text-zinc-400">{summary?.pending || 0}</p>
        </div>
        <div className="shadcn-card p-4 space-y-1">
          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Sedang Dikerjakan</p>
          <p className="text-lg font-bold text-amber-400">{summary?.inProgress || 0}</p>
        </div>
        <div className="shadcn-card p-4 space-y-1">
          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Selesai</p>
          <p className="text-lg font-bold text-emerald-400">{summary?.completed || 0}</p>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Panel */}
        <div className="shadcn-card p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-zinc-800 pb-2.5">
            <Filter className="h-4 w-4 text-zinc-400" />
            Filter
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
              >
                <option value="">Semua Status</option>
                <option value="pending">Belum Dikerjakan</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="completed">Selesai</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Prioritas</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
              >
                <option value="">Semua Prioritas</option>
                <option value="high">Tinggi (High)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="low">Rendah (Low)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
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
                className="shadcn-btn-secondary w-full py-1.5 text-xs cursor-pointer"
              >
                Terapkan Filter
              </button>
              {(filterStatus || filterPriority || filterCategory) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="shadcn-btn-outline w-full py-1.5 text-xs cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tasks List */}
        <div className="shadcn-card p-5 space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 className="text-sm font-semibold text-white">Daftar Kegiatan</h3>
            <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              {todos.length} Tugas
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"></div>
              <p className="mt-3 text-[10px] text-zinc-500">Memuat data...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              Belum ada tugas tercatat.
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-3.5 rounded-md border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-900/10 transition-all group ${
                    todo.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleStatus(todo)}
                      className="shrink-0 focus:outline-none"
                    >
                      {getStatusIcon(todo.status)}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <p className={`font-medium text-xs text-zinc-200 truncate ${
                        todo.status === 'completed' ? 'line-through text-zinc-500' : ''
                      }`}>
                        {todo.title}
                      </p>
                      
                      <div className="flex flex-wrap gap-2.5 items-center text-[9px] text-zinc-550">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${getPriorityStyle(todo.priority)}`}>
                          {todo.priority}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-zinc-650" />
                          {todo.category}
                        </span>

                        {todo.deadline && (
                          <span className={`flex items-center gap-1 ${
                            todo.status !== 'completed' && new Date(todo.deadline) < new Date()
                              ? 'text-rose-400 font-bold'
                              : 'text-zinc-500'
                          }`}>
                            <Calendar className="h-3 w-3 text-zinc-650" />
                            {new Date(todo.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            {todo.status !== 'completed' && new Date(todo.deadline) < new Date() && ' (Terlambat)'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleOpenEdit(todo)}
                      className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-all"
                      title="Ubah"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-rose-450 rounded transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popup Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

          <div className="relative w-full max-w-md shadcn-card p-5 shadow-lg animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-semibold text-white">
                {editingTodo ? 'Ubah Tugas' : 'Tambah Tugas'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-350"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="shadcn-input block w-full px-3 py-2 text-sm bg-zinc-950"
                  placeholder="Misalnya: Ngerjakan PR Alpro"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Todo['priority'])}
                    className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
                  >
                    <option value="low">Rendah (Low)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="high">Tinggi (High)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Deadline (Opsional)</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Todo['status'])}
                    className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
                  >
                    <option value="pending">Belum Dikerjakan</option>
                    <option value="in_progress">Sedang Dikerjakan</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="shadcn-btn-secondary py-2 px-3 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="shadcn-btn-primary py-2 px-4 cursor-pointer"
                >
                  {editingTodo ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

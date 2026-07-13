'use client';

import { useEffect, useState } from 'react';
import { useTodoStore, Todo } from '@/store/todo-store';
import { Plus, Trash2, Edit2, Calendar, Tag, CheckCircle2, Circle, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Separate Form component to prevent parent list re-renders on keystroke
interface TodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTodo: Todo | null;
  onSave: (payload: { title: string; priority: Todo['priority']; status: Todo['status']; category: string; deadline: string | null }) => Promise<void>;
  categories: string[];
}

function TodoDialog({ open, onOpenChange, editingTodo, onSave, categories }: TodoDialogProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [status, setStatus] = useState<Todo['status']>('pending');
  const [category, setCategory] = useState('Kuliah');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingTodo) {
        setTitle(editingTodo.title);
        setPriority(editingTodo.priority);
        setStatus(editingTodo.status);
        setCategory(editingTodo.category);
        setDeadline(editingTodo.deadline ? new Date(editingTodo.deadline).toISOString().split('T')[0] : '');
      } else {
        setTitle('');
        setPriority('medium');
        setStatus('pending');
        setCategory('Kuliah');
        setDeadline('');
      }
    }
  }, [open, editingTodo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave({
        title,
        priority,
        status,
        category,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
      onOpenChange(false);
    } catch (err) {
      alert('Gagal menyimpan tugas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
        <DialogHeader className="border-b border-border pb-2">
          <DialogTitle className="text-sm font-semibold">
            {editingTodo ? 'Ubah Tugas' : 'Tambah Tugas'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Judul Kegiatan</label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-input text-sm"
              placeholder="Misalnya: Ngerjakan PR Alpro"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Prioritas</label>
              <Select value={priority} onValueChange={(val) => setPriority((val as Todo['priority']) || 'medium')}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Prioritas" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1">
                  <SelectItem value="low" className="rounded hover:bg-accent cursor-pointer">Rendah (Low)</SelectItem>
                  <SelectItem value="medium" className="rounded hover:bg-accent cursor-pointer">Sedang (Medium)</SelectItem>
                  <SelectItem value="high" className="rounded hover:bg-accent cursor-pointer">Tinggi (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Kategori</label>
              <Select value={category} onValueChange={(val) => setCategory(val || 'Kuliah')}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="rounded hover:bg-accent cursor-pointer">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Deadline (Opsional)</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-background border-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Status</label>
              <Select value={status} onValueChange={(val) => setStatus((val as Todo['status']) || 'pending')}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Status Pengerjaan" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1">
                  <SelectItem value="pending" className="rounded hover:bg-accent cursor-pointer">Belum Dikerjakan</SelectItem>
                  <SelectItem value="in_progress" className="rounded hover:bg-accent cursor-pointer">Sedang Dikerjakan</SelectItem>
                  <SelectItem value="completed" className="rounded hover:bg-accent cursor-pointer">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0 border-t border-border mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-xs"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="cursor-pointer text-xs"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : editingTodo ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['Kuliah', 'Tugas Besar', 'Personal Project', 'Pekerjaan Rumah', 'Lainnya'];

  // Reactive Auto Filtering
  useEffect(() => {
    fetchTodos({
      status: filterStatus === 'all' ? undefined : filterStatus,
      priority: filterPriority === 'all' ? undefined : filterPriority,
      category: filterCategory === 'all' ? undefined : filterCategory,
    });
  }, [filterStatus, filterPriority, filterCategory, fetchTodos]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, todos]); // refetch summary when todos changes

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterCategory('all');
  };

  const handleOpenAdd = () => {
    setEditingTodo(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleSaveTodo = async (payload: { title: string; priority: Todo['priority']; status: Todo['status']; category: string; deadline: string | null }) => {
    if (editingTodo) {
      await editTodo(editingTodo.id, payload);
    } else {
      await addTodo(payload);
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
      case 'high': return 'bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60';
      case 'medium': return 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60';
      case 'low': return 'bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
    }
  };

  const getStatusIcon = (status: Todo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 cursor-pointer shrink-0" />;
      case 'in_progress':
        return <Clock className="h-4.5 w-4.5 text-amber-500 cursor-pointer shrink-0" />;
      default:
        return <Circle className="h-4.5 w-4.5 text-zinc-300 dark:text-zinc-700 cursor-pointer shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Daftar Tugas (To-Do List)</h2>
          <p className="text-xs text-muted-foreground">Atur prioritas tugas kuliah dan personal project Anda.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          size="sm"
          className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Tugas
        </Button>
      </div>

      {/* Task Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Tugas</p>
            <p className="text-lg font-bold">{summary?.total || 0}</p>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Belum Dikerjakan</p>
            <p className="text-lg font-bold text-zinc-500">{summary?.pending || 0}</p>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sedang Dikerjakan</p>
            <p className="text-lg font-bold text-amber-500">{summary?.inProgress || 0}</p>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-4 space-y-1">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Selesai</p>
            <p className="text-lg font-bold text-emerald-500">{summary?.completed || 0}</p>
          </CardHeader>
        </Card>
      </div>

      {/* Main Grid Area */}
      <div className="w-full">
        {/* Tasks List */}
        <Card className="shadow-sm w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Daftar Kegiatan</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">Kelola dan pantau seluruh tugas kuliah Anda.</p>
            </div>
            
            <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full w-fit">
              {todos.length} Tugas
            </span>
          </CardHeader>
          
          <CardContent className="pt-4 space-y-4">
            {/* Horizontal Filter Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/40">
              {/* Segmented Controls for Status */}
              <div className="bg-[#f4f4f5] dark:bg-zinc-900/60 p-0.5 rounded-lg flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground w-fit shrink-0">
                {[
                  { id: 'all', label: 'Semua', count: summary?.total || 0 },
                  { id: 'pending', label: 'Belum', count: summary?.pending || 0 },
                  { id: 'completed', label: 'Selesai', count: summary?.completed || 0 },
                ].map((tab) => {
                  const isActive = filterStatus === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterStatus(tab.id)}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-white dark:bg-zinc-800 text-foreground shadow-xs font-bold'
                          : 'hover:text-foreground hover:bg-zinc-200/40 dark:hover:bg-zinc-800/20'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full transition-colors duration-200 ${
                        isActive 
                          ? 'bg-zinc-100 dark:bg-zinc-900 text-foreground' 
                          : 'bg-zinc-200/50 dark:bg-zinc-800/60 text-muted-foreground/80'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Priority and Category Dropdowns Inline */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Priority Selector */}
                <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val || 'all')}>
                  <SelectTrigger className="h-8 text-[11px] min-w-[120px] bg-background border border-border rounded-md px-2.5 py-1">
                    <span>
                      {filterPriority === 'all' ? 'Semua Prioritas' :
                       filterPriority === 'high' ? 'Tinggi' :
                       filterPriority === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1 min-w-[120px]">
                    <SelectItem value="all" className="rounded hover:bg-accent cursor-pointer text-xs">Semua Prioritas</SelectItem>
                    <SelectItem value="high" className="rounded hover:bg-accent cursor-pointer text-xs">Tinggi (High)</SelectItem>
                    <SelectItem value="medium" className="rounded hover:bg-accent cursor-pointer text-xs">Sedang (Medium)</SelectItem>
                    <SelectItem value="low" className="rounded hover:bg-accent cursor-pointer text-xs">Rendah (Low)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Selector */}
                <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || 'all')}>
                  <SelectTrigger className="h-8 text-[11px] min-w-[120px] bg-background border border-border rounded-md px-2.5 py-1">
                    <span>{filterCategory === 'all' ? 'Semua Kategori' : filterCategory}</span>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1 min-w-[120px]">
                    <SelectItem value="all" className="rounded hover:bg-accent cursor-pointer text-xs">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded hover:bg-accent cursor-pointer text-xs">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reset button inline if filter is active */}
                {(filterPriority !== 'all' || filterCategory !== 'all' || filterStatus !== 'all') && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                    className="h-8 text-[11px] px-2.5 cursor-pointer hover:bg-muted border border-dashed border-border"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-3 text-[10px] text-muted-foreground">Memuat data...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                Belum ada tugas tercatat.
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center justify-between p-3.5 rounded-md border border-border bg-muted/20 hover:bg-muted/40 transition-all group ${
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
                        <p className={`font-medium text-xs text-foreground truncate ${
                          todo.status === 'completed' ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {todo.title}
                        </p>
                        
                        <div className="flex flex-wrap gap-2.5 items-center text-[9px] text-muted-foreground">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${getPriorityStyle(todo.priority)}`}>
                            {todo.priority}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {todo.category}
                          </span>

                          {todo.deadline && (
                            <span className={`flex items-center gap-1 ${
                              todo.status !== 'completed' && new Date(todo.deadline) < new Date()
                                ? 'text-rose-600 dark:text-rose-455 font-bold'
                                : 'text-muted-foreground'
                            }`}>
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(todo.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              {todo.status !== 'completed' && new Date(todo.deadline) < new Date() && ' (Terlambat)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        onClick={() => handleOpenEdit(todo)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Ubah"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(todo.id)}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TodoDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingTodo={editingTodo}
        onSave={handleSaveTodo}
        categories={categories}
      />
    </div>
  );
}

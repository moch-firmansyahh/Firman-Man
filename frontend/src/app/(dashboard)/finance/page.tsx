'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore, Transaction } from '@/store/finance-store';
import { Wallet, Plus, Trash2, Edit2, ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTx: Transaction | null;
  onSave: (payload: { type: 'income' | 'expense'; amount: number; category: string; note: string | null; date: string }) => Promise<void>;
  categories: string[];
}

function TransactionDialog({ open, onOpenChange, editingTx, onSave, categories }: TransactionDialogProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makan');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingTx) {
        setType(editingTx.type);
        setAmount(editingTx.amount.toString());
        setCategory(editingTx.category);
        setNote(editingTx.note || '');
        setDate(new Date(editingTx.date).toISOString().split('T')[0]);
      } else {
        setType('expense');
        setAmount('');
        setCategory('Makan');
        setNote('');
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [open, editingTx]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSave({
        type,
        amount: parseInt(amount),
        category,
        note: note || null,
        date: new Date(date).toISOString(),
      });
      onOpenChange(false);
    } catch (err) {
      alert('Gagal memproses transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
        <DialogHeader className="border-b border-border pb-2">
          <DialogTitle className="text-sm font-semibold">
            {editingTx ? 'Ubah Transaksi' : 'Tambah Transaksi'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-md border border-border">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-card text-foreground border border-border shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-card text-foreground border border-border shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pemasukan
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Jumlah Transaksi (Rp)</label>
            <Input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-input text-sm"
              placeholder="50000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Kategori</label>
              <Select value={category} onValueChange={(val) => setCategory(val || 'Makan')}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1 min-w-[120px]">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="rounded hover:bg-accent cursor-pointer">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Tanggal</label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background border-input text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Catatan</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-background border-input text-sm resize-none"
              placeholder="Deskripsi singkat..."
            />
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
              {submitting ? 'Menyimpan...' : editingTx ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FinancePage() {
  const {
    transactions,
    summary,
    loading,
    fetchTransactions,
    fetchSummary,
    addTransaction,
    editTransaction,
    deleteTransaction,
  } = useFinanceStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense'
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const displayedTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  const categories = ['Makan', 'Transport', 'Kebutuhan Kuliah', 'Hiburan', 'Tabungan', 'Lainnya'];

  // Reactive Auto Filtering
  useEffect(() => {
    fetchTransactions({
      category: filterCategory === 'all' ? undefined : filterCategory,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [filterCategory, startDate, endDate, fetchTransactions]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, transactions]); // refetch summary when transactions changes

  const handleRangeChange = (preset: string | null) => {
    if (!preset) return;
    setDateRangePreset(preset);
    const now = new Date();
    let start = '';
    let end = '';
    
    switch (preset) {
      case 'today': {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        start = d.toISOString().split('T')[0];
        break;
      }
      case 'last_7_days': {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        start = d.toISOString().split('T')[0];
        break;
      }
      case 'last_30_days': {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        start = d.toISOString().split('T')[0];
        break;
      }
      case 'this_month': {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        start = d.toISOString().split('T')[0];
        break;
      }
      case 'last_month': {
        const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        start = firstOfLastMonth.toISOString().split('T')[0];
        end = lastOfLastMonth.toISOString().split('T')[0];
        break;
      }
      default:
        start = '';
        end = '';
        break;
    }
    
    setStartDate(start);
    setEndDate(end);
  };

  const handleClearFilters = () => {
    setFilterCategory('all');
    setFilterType('all');
    setDateRangePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsFormOpen(true);
  };

  const handleSaveTransaction = async (payload: { type: 'income' | 'expense'; amount: number; category: string; note: string | null; date: string }) => {
    if (editingTx) {
      await editTransaction(editingTx.id, payload);
    } else {
      await addTransaction(payload);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus transaksi ini?')) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        alert('Gagal menghapus transaksi.');
      }
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Manajemen Keuangan</h2>
          <p className="text-xs text-muted-foreground">Catat pemasukan dan pengeluaran harian Anda.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          size="sm"
          className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Saldo Dompet</span>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${summary ? (summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-455' : 'text-rose-600 dark:text-rose-455') : 'text-foreground'}`}>
              {summary ? formatRupiah(summary.balance) : 'Rp 0'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{summary?.transactionsCount || 0} Total Transaksi</p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Total Pemasukan</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary ? formatRupiah(summary.totalIncome) : 'Rp 0'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Aliran dana masuk</p>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Total Pengeluaran</span>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {summary ? formatRupiah(summary.totalExpense) : 'Rp 0'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Aliran dana keluar</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full">
        {/* Transactions List */}
        <Card className="shadow-sm w-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Riwayat Transaksi</CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">Kelola dan pantau seluruh transaksi keuangan Anda.</p>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full w-fit">
              {displayedTransactions.length} Item
            </span>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Horizontal Filter Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/40">
              {/* Segmented Controls for Transaction Type */}
              <div className="bg-[#f4f4f5] dark:bg-zinc-900/60 p-0.5 rounded-lg flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground w-fit shrink-0">
                {[
                  { id: 'all', label: 'Semua', count: transactions.length },
                  { id: 'income', label: 'Pemasukan', count: transactions.filter(t => t.type === 'income').length },
                  { id: 'expense', label: 'Pengeluaran', count: transactions.filter(t => t.type === 'expense').length },
                ].map((tab) => {
                  const isActive = filterType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterType(tab.id)}
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

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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

                {/* Date Range Preset Selector */}
                <Select value={dateRangePreset} onValueChange={handleRangeChange}>
                  <SelectTrigger className="h-8 text-[11px] min-w-[140px] bg-background border border-border rounded-md px-2.5 py-1">
                    <span>
                      {dateRangePreset === 'all' ? 'Semua Waktu' :
                       dateRangePreset === 'today' ? 'Hari Ini' :
                       dateRangePreset === 'last_7_days' ? '7 Hari Terakhir' :
                       dateRangePreset === 'last_30_days' ? '30 Hari Terakhir' :
                       dateRangePreset === 'this_month' ? 'Bulan Ini' : 'Bulan Lalu'}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1 min-w-[140px]">
                    <SelectItem value="all" className="rounded hover:bg-accent cursor-pointer text-xs">Semua Waktu</SelectItem>
                    <SelectItem value="today" className="rounded hover:bg-accent cursor-pointer text-xs">Hari Ini</SelectItem>
                    <SelectItem value="last_7_days" className="rounded hover:bg-accent cursor-pointer text-xs">7 Hari Terakhir</SelectItem>
                    <SelectItem value="last_30_days" className="rounded hover:bg-accent cursor-pointer text-xs">30 Hari Terakhir</SelectItem>
                    <SelectItem value="this_month" className="rounded hover:bg-accent cursor-pointer text-xs">Bulan Ini</SelectItem>
                    <SelectItem value="last_month" className="rounded hover:bg-accent cursor-pointer text-xs">Bulan Lalu</SelectItem>
                  </SelectContent>
                </Select>

                {/* Reset button inline if filter is active */}
                {(filterCategory !== 'all' || dateRangePreset !== 'all' || filterType !== 'all') && (
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

            <div className="pt-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-3 text-[10px] text-muted-foreground">Memuat data...</p>
              </div>
            ) : displayedTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              <div className="divide-y divide-border space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {displayedTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 hover:bg-muted/30 px-2 rounded-md transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 border ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-955/20 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-455'
                      }`}>
                        {tx.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground truncate">{tx.category}</span>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5 max-w-[200px] md:max-w-[400px]">
                          {tx.note || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`font-bold text-xs shrink-0 ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => handleOpenEdit(tx)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(tx.id)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingTx={editingTx}
        onSave={handleSaveTransaction}
        categories={categories}
      />
    </div>
  );
}

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const handleClearFilters = () => {
    setFilterCategory('all');
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
              {transactions.length} Item
            </span>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Horizontal Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Selector */}
                <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || 'all')}>
                  <SelectTrigger className="h-8 text-[11px] min-w-[120px] bg-background border border-border rounded-md px-2.5 py-1">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border text-foreground rounded-md shadow-md p-1 min-w-[120px]">
                    <SelectItem value="all" className="rounded hover:bg-accent cursor-pointer text-xs">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded hover:bg-accent cursor-pointer text-xs">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Start Date Input */}
                <div className="flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 h-8">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Mulai</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-[11px] border-none outline-none focus:ring-0 text-foreground w-[110px]"
                  />
                </div>

                {/* End Date Input */}
                <div className="flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 h-8">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Selesai</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-[11px] border-none outline-none focus:ring-0 text-foreground w-[110px]"
                  />
                </div>

                {/* Reset button inline if filter is active */}
                {(filterCategory !== 'all' || startDate || endDate) && (
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
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                Belum ada transaksi tercatat.
              </div>
            ) : (
              <div className="divide-y divide-border space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
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

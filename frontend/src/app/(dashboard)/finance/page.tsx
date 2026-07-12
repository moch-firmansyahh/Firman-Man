'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore, Transaction } from '@/store/finance-store';
import { Wallet, Plus, Trash2, Edit2, ArrowDownRight, ArrowUpRight, X, Filter } from 'lucide-react';

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

  // Form inputs
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makan');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const categories = ['Makan', 'Transport', 'Kebutuhan Kuliah', 'Hiburan', 'Tabungan', 'Lainnya'];

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
    setDate(new Date().toISOString().split('T')[0]);
  }, [fetchTransactions, fetchSummary]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions({
      category: filterCategory || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClearFilters = () => {
    setFilterCategory('');
    setStartDate('');
    setEndDate('');
    fetchTransactions();
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setType('expense');
    setAmount('');
    setCategory('Makan');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setType(tx.type);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setNote(tx.note || '');
    setDate(new Date(tx.date).toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type,
      amount: parseInt(amount),
      category,
      note: note || null,
      date: new Date(date).toISOString(),
    };

    try {
      if (editingTx) {
        await editTransaction(editingTx.id, payload);
      } else {
        await addTransaction(payload);
      }
      setIsFormOpen(false);
    } catch (err) {
      alert('Gagal memproses transaksi.');
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
          <h2 className="text-xl font-semibold text-white tracking-tight">Manajemen Keuangan</h2>
          <p className="text-xs text-zinc-400">Catat pemasukan dan pengeluaran harian Anda.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="shadcn-btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="shadcn-card p-5 space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Saldo Dompet</div>
          <div className={`text-xl font-bold ${summary ? (summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
            {summary ? formatRupiah(summary.balance) : 'Rp 0'}
          </div>
          <p className="text-[10px] text-zinc-500">{summary?.transactionsCount || 0} Total Transaksi</p>
        </div>

        {/* Income Card */}
        <div className="shadcn-card p-5 space-y-1">
          <div className="text-xs text-zinc-400 font-medium flex items-center justify-between">
            <span>Total Pemasukan</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500/80" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {summary ? formatRupiah(summary.totalIncome) : 'Rp 0'}
          </div>
          <p className="text-[10px] text-zinc-500">Aliran dana masuk</p>
        </div>

        {/* Expense Card */}
        <div className="shadcn-card p-5 space-y-1">
          <div className="text-xs text-zinc-400 font-medium flex items-center justify-between">
            <span>Total Pengeluaran</span>
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-500/80" />
          </div>
          <div className="text-xl font-bold text-rose-400">
            {summary ? formatRupiah(summary.totalExpense) : 'Rp 0'}
          </div>
          <p className="text-[10px] text-zinc-500">Aliran dana keluar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Panel */}
        <div className="shadcn-card p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-zinc-800 pb-2.5">
            <Filter className="h-4 w-4 text-zinc-400" />
            Filter
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-3">
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="shadcn-btn-secondary w-full py-1.5 text-xs cursor-pointer"
              >
                Terapkan Filter
              </button>
              {(filterCategory || startDate || endDate) && (
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

        {/* Transactions List */}
        <div className="shadcn-card p-5 space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <h3 className="text-sm font-semibold text-white">Riwayat Transaksi</h3>
            <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
              {transactions.length} Item
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent"></div>
              <p className="mt-3 text-[10px] text-zinc-500">Memuat data...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              Belum ada transaksi tercatat.
            </div>
          ) : (
            <div className="divide-y divide-zinc-900 space-y-1.5">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2.5 hover:bg-zinc-900/30 px-2 rounded-md transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 border ${
                      tx.type === 'income'
                        ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400'
                        : 'bg-rose-950/20 border-rose-900/60 text-rose-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-zinc-200 truncate">{tx.category}</span>
                        <span className="text-[9px] text-zinc-500">
                          {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5 max-w-[200px] md:max-w-[400px]">
                        {tx.note || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-xs shrink-0 ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 rounded transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                {editingTx ? 'Ubah Transaksi' : 'Tambah Transaksi'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-350"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-md border border-zinc-900">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 rounded text-xs font-semibold transition-all ${
                    type === 'expense'
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 rounded text-xs font-semibold transition-all ${
                    type === 'income'
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Jumlah Transaksi (Rp)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="shadcn-input block w-full px-3 py-2 text-sm bg-zinc-950"
                  placeholder="50000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="shadcn-input block w-full px-3 py-2 text-xs bg-zinc-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Catatan</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="shadcn-input block w-full px-3 py-2 text-sm bg-zinc-950 resize-none"
                  placeholder="Deskripsi singkat..."
                />
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
                  {editingTx ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

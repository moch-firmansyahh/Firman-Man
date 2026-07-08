'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore, Transaction } from '@/store/finance-store';
import { Wallet, Plus, Trash2, Edit2, ArrowDownRight, ArrowUpRight, Calendar, Tag, FileText, X, Filter } from 'lucide-react';

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
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Manajemen Keuangan</h2>
          <p className="text-sm text-zinc-400">Catat pemasukan dan pengeluaran harian Anda dengan mudah.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-400 group-hover:scale-110 transition-all">
            <Wallet className="h-16 w-16" />
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Saldo Saat Ini</p>
          <p className={`text-2xl font-extrabold mt-2 ${summary ? (summary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
            {summary ? formatRupiah(summary.balance) : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
            <span>Total dari {summary?.transactionsCount || 0} transaksi</span>
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-400 group-hover:scale-110 transition-all">
            <ArrowUpRight className="h-16 w-16" />
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Pemasukan</p>
          <p className="text-2xl font-extrabold mt-2 text-emerald-400">
            {summary ? formatRupiah(summary.totalIncome) : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs text-emerald-500/80 font-medium">
            <ArrowUpRight className="h-4.5 w-4.5 shrink-0" />
            <span>Aliran dana masuk</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-400 group-hover:scale-110 transition-all">
            <ArrowDownRight className="h-16 w-16" />
          </div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Pengeluaran</p>
          <p className="text-2xl font-extrabold mt-2 text-rose-400">
            {summary ? formatRupiah(summary.totalExpense) : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs text-rose-500/80 font-medium">
            <ArrowDownRight className="h-4.5 w-4.5 shrink-0" />
            <span>Aliran dana keluar</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Panel */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-zinc-800 pb-3">
            <Filter className="h-4.5 w-4.5 text-indigo-400" />
            Filter Transaksi
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-4">
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all"
              >
                Terapkan Filter
              </button>
              {(filterCategory || startDate || endDate) && (
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

        {/* Transactions List */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white">Riwayat Transaksi</h3>
            <span className="text-xs font-semibold text-zinc-500">{transactions.length} Item</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-xs text-zinc-500">Memuat transaksi...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-400">Belum ada transaksi</p>
              <p className="text-xs text-zinc-500 mt-1">Silakan tambahkan transaksi pertama Anda.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-850 space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-zinc-950/20 px-2 rounded-xl transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-zinc-200 truncate">{tx.category}</span>
                        <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-medium">
                          {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5 max-w-[250px] md:max-w-[400px]">
                        {tx.note || 'Tidak ada catatan'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-sm shrink-0 ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 hover:bg-rose-950/30 text-zinc-500 hover:text-rose-400 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                {editingTx ? 'Ubah Transaksi' : 'Tambah Transaksi Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-zinc-950/40 p-1 rounded-xl border border-zinc-900">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 px-4 rounded-lg font-bold text-xs transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  Pengeluaran (Expense)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 px-4 rounded-lg font-bold text-xs transition-all ${
                    type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  Pemasukan (Income)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Jumlah Transaksi (Rp)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="50000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Catatan</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Makan siang bersama teman / Beli buku kuliah..."
                />
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
                  {editingTx ? 'Perbarui' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

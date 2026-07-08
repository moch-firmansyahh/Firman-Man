'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { useTodoStore } from '@/store/todo-store';
import { Wallet, ArrowUpRight, ArrowDownRight, CheckSquare, Calendar, AlertTriangle, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DashboardPage() {
  const { summary: financeSummary, transactions, fetchSummary: fetchFinanceSummary, fetchTransactions } = useFinanceStore();
  const { summary: todoSummary, fetchSummary: fetchTodoSummary } = useTodoStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchFinanceSummary();
    fetchTransactions();
    fetchTodoSummary();
  }, [fetchFinanceSummary, fetchTransactions, fetchTodoSummary]);

  // Aggregate expenses by category for chart representation
  const getChartData = () => {
    if (!transactions || transactions.length === 0) {
      return [
        { name: 'Makan', Pengeluaran: 0 },
        { name: 'Transport', Pengeluaran: 0 },
        { name: 'Kuliah', Pengeluaran: 0 },
        { name: 'Hiburan', Pengeluaran: 0 },
      ];
    }

    const expenseMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
      });

    const data = Object.keys(expenseMap).map((cat) => ({
      name: cat,
      Pengeluaran: expenseMap[cat],
    }));

    return data.length > 0 ? data : [{ name: 'Belum ada data', Pengeluaran: 0 }];
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const completionRate = todoSummary?.total
    ? Math.round((todoSummary.completed / todoSummary.total) * 100)
    : 0;

  if (!mounted) return null;

  const chartData = getChartData();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Selamat Datang di FirmanMan</h2>
        <p className="text-sm text-zinc-400">Ringkasan kondisi finansial dan rencana tugas Anda untuk hari ini.</p>
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Balance */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dompet Saldo</p>
          <p className={`text-xl font-black mt-2 ${financeSummary ? (financeSummary.balance >= 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-white'}`}>
            {financeSummary ? formatRupiah(financeSummary.balance) : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
            <Wallet className="h-3.5 w-3.5" />
            <span>Keseimbangan Pemasukan & Pengeluaran</span>
          </div>
        </div>

        {/* Income */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pemasukan Bulan Ini</p>
          <p className="text-xl font-black mt-2 text-emerald-400">
            {financeSummary ? formatRupiah(financeSummary.totalIncome) : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-emerald-500/80 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Aliran Kas Masuk</span>
          </div>
        </div>

        {/* Expense */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pengeluaran Bulan Ini</p>
          <p className="text-xl font-black mt-2 text-rose-400">
            {financeSummary ? formatRupiah(financeSummary.totalExpense) : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-rose-500/80 font-medium">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Aliran Kas Keluar</span>
          </div>
        </div>

        {/* Task Progress */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Progres Tugas</p>
          <p className="text-xl font-black mt-2 text-indigo-400">
            {completionRate}% Selesai
          </p>
          <div className="mt-4 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Chart (Left columns) */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800/80 pb-3">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
            <h3 className="text-sm font-bold">Distribusi Pengeluaran per Kategori</h3>
          </div>

          <div className="h-64 w-full text-xs">
            {transactions.filter(t => t.type === 'expense').length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 font-medium">
                Belum ada transaksi pengeluaran untuk divisualisasikan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0c0e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(val) => [formatRupiah(Number(val)), 'Pengeluaran']}
                  />
                  <Bar dataKey="Pengeluaran" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Approaching Deadline (Right column) */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800/80 pb-3">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
            <h3 className="text-sm font-bold">Mendekati Deadline</h3>
          </div>

          <div className="space-y-3">
            {!todoSummary || todoSummary.approachingDeadline.length === 0 ? (
              <div className="py-12 text-center">
                <CheckSquare className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 font-semibold">Semua tugas aman!</p>
                <p className="text-[10px] text-zinc-650 mt-0.5">Tidak ada tugas tidak selesai yang memiliki deadline dekat.</p>
              </div>
            ) : (
              todoSummary.approachingDeadline.map((todo) => {
                const isOverdue = todo.deadline && new Date(todo.deadline) < new Date();
                return (
                  <div key={todo.id} className="flex gap-3 p-3 bg-zinc-950/20 border border-zinc-900 rounded-xl items-start">
                    <div className={`p-1.5 rounded-lg border ${
                      isOverdue
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    } shrink-0`}>
                      <AlertCircle className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="font-semibold text-xs text-zinc-200 truncate">{todo.title}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-medium">
                        <span className="capitalize">{todo.priority} Prioritas</span>
                        <span>•</span>
                        {todo.deadline && (
                          <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                            {new Date(todo.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            {isOverdue && ' (Terlambat)'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { useTodoStore } from '@/store/todo-store';
import { Wallet, ArrowUpRight, ArrowDownRight, CheckSquare, BarChart3, AlertTriangle } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Dashboard Ringkasan</h2>
        <p className="text-xs text-zinc-500">Ringkasan kondisi finansial harian dan progres tugas kuliah Anda.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="shadcn-card p-5 shadow-sm bg-white space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Saldo Dompet</span>
            <Wallet className="h-4 w-4 text-zinc-400" />
          </div>
          <div className={`text-xl font-bold ${financeSummary ? (financeSummary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-zinc-900'}`}>
            {financeSummary ? formatRupiah(financeSummary.balance) : 'Rp 0'}
          </div>
          <p className="text-[10px] text-zinc-400">Keseimbangan saat ini</p>
        </div>

        {/* Income Card */}
        <div className="shadcn-card p-5 shadow-sm bg-white space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Pemasukan Bulan Ini</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {financeSummary ? formatRupiah(financeSummary.totalIncome) : 'Rp 0'}
          </div>
          <p className="text-[10px] text-zinc-400">Aliran kas masuk</p>
        </div>

        {/* Expense Card */}
        <div className="shadcn-card p-5 shadow-sm bg-white space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Pengeluaran Bulan Ini</span>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600">
            {financeSummary ? formatRupiah(financeSummary.totalExpense) : 'Rp 0'}
          </div>
          <p className="text-[10px] text-zinc-400">Aliran kas keluar</p>
        </div>

        {/* Progress Card */}
        <div className="shadcn-card p-5 shadow-sm bg-white space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-medium">Tugas Selesai</span>
            <CheckSquare className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {completionRate}%
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1 mt-2">
            <div className="bg-indigo-600 h-1 rounded-full transition-all duration-300" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Distribution Chart */}
        <div className="shadcn-card p-5 bg-white space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
            <BarChart3 className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Distribusi Pengeluaran</h3>
          </div>

          <div className="h-60 w-full text-xs">
            {transactions.filter(t => t.type === 'expense').length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400">
                Belum ada transaksi pengeluaran.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      color: '#09090b',
                    }}
                    formatter={(val) => [formatRupiah(Number(val)), 'Pengeluaran']}
                  />
                  <Bar dataKey="Pengeluaran" fill="#18181b" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#18181b' : '#71717a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Approaching Deadline Tasks */}
        <div className="shadcn-card p-5 bg-white space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-zinc-900">Tugas Terdekat</h3>
          </div>

          <div className="space-y-3">
            {!todoSummary || todoSummary.approachingDeadline.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">
                Tidak ada tugas yang memiliki deadline dekat.
              </div>
            ) : (
              todoSummary.approachingDeadline.map((todo) => {
                const isOverdue = todo.deadline && new Date(todo.deadline) < new Date();
                return (
                  <div key={todo.id} className="flex flex-col p-3 bg-zinc-50 border border-zinc-200 rounded-md">
                    <span className="font-semibold text-xs text-zinc-800 truncate">{todo.title}</span>
                    <div className="flex items-center justify-between text-[9px] text-zinc-550 mt-2">
                      <span className="capitalize font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                        {todo.priority}
                      </span>
                      {todo.deadline && (
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          {new Date(todo.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          {isOverdue && ' (Terlambat)'}
                        </span>
                      )}
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

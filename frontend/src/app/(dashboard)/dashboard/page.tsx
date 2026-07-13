'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { useTodoStore } from '@/store/todo-store';
import { Wallet, ArrowUpRight, ArrowDownRight, CheckSquare, BarChart3, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const { summary: financeSummary, transactions, fetchSummary: fetchFinanceSummary, fetchTransactions } = useFinanceStore();
  const { summary: todoSummary, fetchSummary: fetchTodoSummary } = useTodoStore();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

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

  // Dynamic colors based on resolving theme
  const primaryColor = resolvedTheme === 'dark' ? '#fafafa' : '#18181b';
  const secondaryColor = resolvedTheme === 'dark' ? '#71717a' : '#a1a1aa';
  const gridColor = resolvedTheme === 'dark' ? '#27272a' : '#e4e4e7';
  const tooltipBg = resolvedTheme === 'dark' ? '#09090b' : '#ffffff';
  const tooltipBorder = resolvedTheme === 'dark' ? '#27272a' : '#e4e4e7';
  const tooltipText = resolvedTheme === 'dark' ? '#fafafa' : '#09090b';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">Dashboard Ringkasan</h2>
        <p className="text-xs text-muted-foreground">Ringkasan kondisi finansial harian dan progres tugas kuliah Anda.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Saldo Dompet</span>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className={`text-xl font-bold ${financeSummary ? (financeSummary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') : 'text-foreground'}`}>
              {financeSummary ? formatRupiah(financeSummary.balance) : 'Rp 0'}
            </div>
            <p className="text-[10px] text-muted-foreground">Keseimbangan saat ini</p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Pemasukan Bulan Ini</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {financeSummary ? formatRupiah(financeSummary.totalIncome) : 'Rp 0'}
            </div>
            <p className="text-[10px] text-muted-foreground">Aliran kas masuk</p>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Pengeluaran Bulan Ini</span>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {financeSummary ? formatRupiah(financeSummary.totalExpense) : 'Rp 0'}
            </div>
            <p className="text-[10px] text-muted-foreground">Aliran kas keluar</p>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-muted-foreground">Tugas Selesai</span>
            <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {completionRate}%
            </div>
            <div className="w-full bg-muted rounded-full h-1 mt-2">
              <div className="bg-indigo-600 dark:bg-indigo-400 h-1 rounded-full transition-all duration-300" style={{ width: `${completionRate}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Distribution Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold">Distribusi Pengeluaran</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-60 w-full text-xs">
              {transactions.filter(t => t.type === 'expense').length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Belum ada transaksi pengeluaran.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" stroke={secondaryColor} fontSize={10} tickLine={false} />
                    <YAxis stroke={secondaryColor} fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        border: `1px solid ${tooltipBorder}`,
                        borderRadius: '8px',
                        color: tooltipText,
                      }}
                      formatter={(val) => [formatRupiah(Number(val)), 'Pengeluaran']}
                    />
                    <Bar dataKey="Pengeluaran" fill={primaryColor} radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? primaryColor : secondaryColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approaching Deadline Tasks */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-3">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold">Tugas Terdekat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {!todoSummary || todoSummary.approachingDeadline.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  Tidak ada tugas yang memiliki deadline dekat.
                </div>
              ) : (
                todoSummary.approachingDeadline.map((todo) => {
                  const isOverdue = todo.deadline && new Date(todo.deadline) < new Date();
                  return (
                    <div key={todo.id} className="flex flex-col p-3 bg-muted/40 border border-border rounded-md">
                      <span className="font-semibold text-xs text-foreground truncate">{todo.title}</span>
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-2">
                        <span className="capitalize font-semibold text-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                          {todo.priority}
                        </span>
                        {todo.deadline && (
                          <span className={isOverdue ? 'text-rose-600 dark:text-rose-450 font-bold' : ''}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

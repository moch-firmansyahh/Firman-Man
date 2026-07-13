'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/finance-store';
import { useTodoStore } from '@/store/todo-store';
import { Wallet, ArrowUpRight, ArrowDownRight, CheckSquare, BarChart3, AlertTriangle, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const { summary: financeSummary, transactions, fetchSummary: fetchFinanceSummary, fetchTransactions } = useFinanceStore();
  const { summary: todoSummary, fetchSummary: fetchTodoSummary } = useTodoStore();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  // Time range selector state
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | 'ALL'>('ALL');

  useEffect(() => {
    setMounted(true);
    fetchFinanceSummary();
    fetchTransactions();
    fetchTodoSummary();
  }, [fetchFinanceSummary, fetchTransactions, fetchTodoSummary]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const getFilteredTransactions = () => {
    if (!transactions) return [];
    
    // Sort transactions chronologically
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const now = new Date();
    if (timeRange === '1W') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return sorted.filter((t) => new Date(t.date) >= oneWeekAgo);
    } else if (timeRange === '1M') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(now.getDate() - 30);
      return sorted.filter((t) => new Date(t.date) >= oneMonthAgo);
    }
    return sorted;
  };

  const getChartData = () => {
    const filtered = getFilteredTransactions();
    const expenses = filtered.filter((t) => t.type === 'expense');

    if (expenses.length === 0) {
      return [
        { name: 'Senin', Pengeluaran: 0 },
        { name: 'Selasa', Pengeluaran: 0 },
        { name: 'Rabu', Pengeluaran: 0 },
        { name: 'Kamis', Pengeluaran: 0 },
      ];
    }

    // Group expenses by date
    const grouped: Record<string, number> = {};
    expenses.forEach((t) => {
      const dateLabel = new Date(t.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
      grouped[dateLabel] = (grouped[dateLabel] || 0) + t.amount;
    });

    return Object.keys(grouped).map((key) => ({
      name: key,
      Pengeluaran: grouped[key],
    }));
  };

  const getFilteredTotalExpense = () => {
    const filtered = getFilteredTransactions();
    return filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const completionRate = todoSummary?.total
    ? Math.round((todoSummary.completed / todoSummary.total) * 100)
    : 0;

  if (!mounted) return null;

  const chartData = getChartData();
  const filteredTotalExpense = getFilteredTotalExpense();

  // Color constants based on theme
  const gridColor = resolvedTheme === 'dark' ? '#27272a' : '#f4f4f5';
  const axisColor = resolvedTheme === 'dark' ? '#71717a' : '#a1a1aa';
  const tooltipBg = resolvedTheme === 'dark' ? '#09090b' : '#ffffff';
  const tooltipBorder = resolvedTheme === 'dark' ? '#27272a' : '#e4e4e7';

  // Custom Tooltip component matching the screenshot
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="bg-popover border text-popover-foreground rounded-lg shadow-md p-3 space-y-1 text-xs"
          style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
        >
          <p className="font-semibold text-foreground">{label}</p>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-teal-500" />
            <span className="text-muted-foreground">
              Pengeluaran: <strong className="text-foreground">{formatRupiah(payload[0].value)}</strong>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

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
            <div className={`text-xl font-bold ${financeSummary ? (financeSummary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-455' : 'text-rose-600 dark:text-rose-455') : 'text-foreground'}`}>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Area Chart matching User Request */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardContent className="pt-6 space-y-4">
            {/* Header info with buttons */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Pengeluaran</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground tracking-tight">
                    {formatRupiah(filteredTotalExpense)}
                  </span>
                  <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5">
                    <TrendingDown className="h-3 w-3" />
                    -4.2% vs kemarin
                  </span>
                </div>
              </div>

              {/* Time Range Pill Selectors */}
              <div className="bg-muted p-0.5 rounded-lg flex border border-border text-[10px] font-semibold">
                <button
                  onClick={() => setTimeRange('1W')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    timeRange === '1W'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  1W
                </button>
                <button
                  onClick={() => setTimeRange('1M')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    timeRange === '1M'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  1M
                </button>
                <button
                  onClick={() => setTimeRange('ALL')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    timeRange === 'ALL'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ALL
                </button>
              </div>
            </div>

            {/* Area Chart View */}
            <div className="w-full text-xs overflow-x-auto scrollbar-thin">
              {transactions.filter(t => t.type === 'expense').length === 0 ? (
                <div className="h-60 flex items-center justify-center text-muted-foreground">
                  Belum ada transaksi pengeluaran.
                </div>
              ) : (
                <div 
                  className="h-60" 
                  style={{ 
                    width: chartData.length > 5 ? `${chartData.length * 100}px` : '100%', 
                    minWidth: '100%' 
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke={axisColor} 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke={axisColor} 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dx={-5}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="Pengeluaran"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approaching Deadline Tasks */}
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border pb-3">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold">Tugas Terdekat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 max-h-[210px] overflow-y-auto pr-1">
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
                          <span className={isOverdue ? 'text-rose-600 dark:text-rose-455 font-bold' : ''}>
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

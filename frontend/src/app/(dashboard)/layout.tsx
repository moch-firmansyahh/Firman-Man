'use client';

import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, CheckSquare, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Keuangan', href: '/finance', icon: Wallet },
    { name: 'Tugas', href: '/todos', icon: CheckSquare },
  ];

  const getPageTitle = () => {
    const item = navItems.find((i) => i.href === pathname);
    return item ? item.name : 'FirmanMan';
  };

  return (
    <div className="flex min-h-screen bg-[#09090b]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-zinc-800/50 sticky top-0 h-screen p-6 justify-between z-30">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-md">
              FM
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              FirmanMan
            </span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                      : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <User className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-300 truncate">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header for Mobile and Page Title */}
        <header className="flex items-center justify-between px-6 py-4 glass-panel border-b border-zinc-800/45 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-200 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <span className="text-sm font-semibold text-zinc-300 max-w-[120px] truncate">{user?.name}</span>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

            <div className="relative flex flex-col w-72 max-w-xs bg-[#09090b] border-r border-zinc-800/80 p-6 z-50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                    FM
                  </div>
                  <span className="font-extrabold text-lg text-white">FirmanMan</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-1.5 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                          : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-zinc-300 truncate">{user?.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Main Content Pages */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

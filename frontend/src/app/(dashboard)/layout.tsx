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
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-900 sticky top-0 h-screen p-5 justify-between z-30">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="h-6 w-6 rounded-md bg-white flex items-center justify-center font-bold text-black text-xs shadow-sm">
              FM
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              FirmanMan
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-zinc-900 text-white border-l-2 border-white'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-zinc-900/40 border border-zinc-900/60">
            <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="h-3.5 w-3.5 text-zinc-300" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-zinc-950/40 border-b border-zinc-900 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-200 focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-white">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium hidden md:inline">Halo, {user?.name}</span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

            <div className="relative flex flex-col w-64 max-w-xs bg-zinc-950 border-r border-zinc-900 p-5 z-50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white flex items-center justify-center font-bold text-black text-xs">
                    FM
                  </div>
                  <span className="font-semibold text-sm text-white">FirmanMan</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-zinc-500 hover:text-zinc-350"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-zinc-900 space-y-4">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-zinc-900/40 border border-zinc-900">
                  <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Main Content Pages */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

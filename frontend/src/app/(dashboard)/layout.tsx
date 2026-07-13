'use client';

import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, CheckSquare, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

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
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border sticky top-0 h-screen p-5 justify-between z-30">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="h-6 w-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-sm">
              FM
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">
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
                      ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-muted/40 border border-border/80">
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-card/60 border-b border-border sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-foreground">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium hidden md:inline mr-2">Halo, {user?.name}</span>
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />

            <div className="relative flex flex-col w-64 max-w-xs bg-card border-r border-border p-5 z-50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs">
                    FM
                  </div>
                  <span className="font-semibold text-sm text-foreground">FirmanMan</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
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
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-muted/40 border border-border">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
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

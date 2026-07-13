'use client';

import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, CheckSquare, LogOut, Menu, X, User, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useState } from 'react';
import { useTodoStore } from '@/store/todo-store';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { summary: todoSummary } = useTodoStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Sidebar open/collapse state for Desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    return item ? item.name : 'FM';
  };

  // Get up to 3 upcoming tasks to show in the sidebar
  const upcomingTasks = todoSummary?.approachingDeadline?.slice(0, 3) || [];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Tugas Besar':
        return 'bg-[#8b5cf6] text-white'; // Solid Violet 500
      case 'Personal Project':
        return 'bg-[#0ea5e9] text-white'; // Solid Sky 500
      case 'Kuliah':
        return 'bg-[#10b981] text-white'; // Solid Emerald 500
      default:
        return 'bg-[#f97316] text-white'; // Solid Orange 500
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-[#f4f4f5] dark:bg-zinc-950 border-r border-border sticky top-0 h-screen justify-between z-30 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-14' : 'w-[220px]'
        }`}
      >
        <div className="flex flex-col min-w-0">
          {/* Sidebar Top: Logo & Toggle Button */}
          {!sidebarCollapsed ? (
            <div className="h-16 flex items-center justify-between px-3.5 border-b border-border/40 transition-all duration-300">
              <div className="flex items-center min-w-0">
                {/* Cyan/blue gradient logo matching Closure.ai style */}
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
                  FM
                </div>
                <span className="font-bold text-xs tracking-tight text-foreground transition-all duration-300 overflow-hidden whitespace-nowrap ml-2">
                  FirmanMan
                </span>
              </div>
              <button 
                onClick={() => setSidebarCollapsed(true)} 
                className="p-1 hover:bg-accent hover:text-accent-foreground rounded-md text-muted-foreground cursor-pointer transition-all duration-200 shrink-0"
                title="Tutup Sidebar"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center border-b border-border/40 transition-all duration-300">
              <button 
                onClick={() => setSidebarCollapsed(false)} 
                className="p-1 hover:bg-accent hover:text-accent-foreground rounded-md text-muted-foreground cursor-pointer transition-all duration-200 shrink-0"
                title="Buka Sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Navigation Links with top margin gap */}
          <nav className="space-y-1 px-2.5 mt-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              let badge = null;
              if (item.name === 'Tugas' && todoSummary?.pending) {
                badge = todoSummary.pending;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`flex items-center justify-between h-9 px-2.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-200/50 dark:bg-zinc-800/60 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <div className="w-5 flex items-center justify-center shrink-0">
                      <Icon className={`h-4 w-4 transition-colors duration-200 ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                      sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-28 opacity-100 ml-2.5'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                  
                  {badge !== null && !sidebarCollapsed && (
                    <span className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 px-1.5 py-0.5 rounded-full font-bold transition-opacity duration-300">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* "Tugas Terdekat" (Closure.ai Recent Cases style section) */}
          {!sidebarCollapsed && upcomingTasks.length > 0 && (
            <div className="mt-7 px-3.5 space-y-2 transition-all duration-300">
              <p className="text-xs font-medium text-[#71717a] dark:text-[#a1a1aa] px-1 mb-1">
                Tugas Terdekat
              </p>
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <Link
                    key={task.id}
                    href="/todos"
                    className="flex items-center gap-2 px-1 py-0.5 rounded-md hover:bg-muted/30 group min-w-0"
                  >
                    {/* Solid circle with white bold initials */}
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 shadow-sm ${getCategoryColor(task.category)}`}>
                      {task.category.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-[#18181b] dark:text-[#f4f4f5] group-hover:text-foreground truncate font-medium">
                      {task.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Bottom: User & Logout */}
        <div className="p-2.5 space-y-2 border-t border-border/40">
          <div className={`flex items-center px-2 py-1.5 rounded-md transition-all duration-200 ${
            sidebarCollapsed ? 'justify-center bg-transparent border-none' : 'bg-muted/30 border border-border/60'
          }`}>
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border shrink-0">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            
            <div className={`truncate transition-all duration-300 overflow-hidden text-left ${
              sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-28 opacity-100 ml-2.5'
            }`}>
              <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center h-9 px-2.5 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-250 cursor-pointer"
            title="Keluar"
          >
            <div className="w-5 flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-left ${
              sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-24 opacity-100 ml-2.5'
            }`}>
              Keluar
            </span>
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
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="h-8 w-8 rounded-full bg-muted hover:bg-accent border border-border text-xs font-bold flex items-center justify-center shadow-sm cursor-pointer text-foreground focus:outline-none transition-all">
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
              } />
              <DropdownMenuContent align="end" className="bg-popover border border-border text-foreground rounded-md shadow-md p-1 min-w-[200px]">
                <div className="px-2.5 py-2 flex flex-col space-y-0.5 select-none">
                  <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground font-normal truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard" />} className="rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/finance" />} className="rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium">
                  <Wallet className="h-3.5 w-3.5" />
                  Keuangan
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/todos" />} className="rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Tugas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="rounded-md hover:bg-destructive/10 hover:text-destructive text-destructive cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold">
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Rocket, LayoutDashboard, FolderGit2, GitBranch, Upload,
  Settings, LogOut, Menu, Bell, Search, BarChart3, Users, ScrollText, Key,
} from 'lucide-react';
import { api } from '@/lib/api';

const mainNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/dashboard/pipelines', label: 'Pipelines', icon: GitBranch },
  { href: '/dashboard/deployments', label: 'Deployments', icon: Upload },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

const managementNav = [
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/tokens', label: 'API Tokens', icon: Key },
  { href: '/dashboard/audit', label: 'Audit Log', icon: ScrollText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>({ name: 'Developer', email: 'dev@autodeployhub.com' });

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      // For demo: don't redirect, show with mock user
      return;
    }
    api.getMe().then((res) => setUser(res.data)).catch(() => {});
  }, []);

  const handleLogout = () => {
    api.clearToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-mesh noise-overlay relative flex">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-[hsla(228,16%,8%,0.95)] backdrop-blur-xl border-r border-white/[0.04] transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 h-12 border-b border-white/[0.04]">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#6C8EFF] to-[#B175FF] flex items-center justify-center">
              <Rocket className="w-3 h-3 text-white" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">AutoDeployHub</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            <div className="space-y-0.5">
              {mainNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                      isActive ? 'nav-active text-foreground pl-[14px]' : 'text-[hsl(220,10%,42%)] hover:text-[hsl(220,10%,62%)] hover:bg-white/[0.02]'
                    }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <p className="px-3 text-[10px] uppercase tracking-widest text-[hsl(220,10%,28%)] font-medium mb-2">Management</p>
              <div className="space-y-0.5">
                {managementNav.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                        isActive ? 'nav-active text-foreground pl-[14px]' : 'text-[hsl(220,10%,42%)] hover:text-[hsl(220,10%,62%)] hover:bg-white/[0.02]'
                      }`}>
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User */}
          <div className="p-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C8EFF] to-[#B175FF] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">{user?.name || 'Developer'}</p>
                <p className="text-[10px] text-[hsl(220,10%,32%)] truncate">{user?.email || ''}</p>
              </div>
              <button onClick={handleLogout} title="Logout"
                className="p-1 text-[hsl(220,10%,32%)] hover:text-foreground rounded transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 relative z-10">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-12 border-b border-white/[0.04] bg-[hsla(228,14%,7%,0.85)] backdrop-blur-xl flex items-center px-5 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded text-[hsl(220,10%,42%)] hover:text-foreground">
            <Menu className="w-4 h-4" />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[hsl(220,10%,28%)]" />
            <span className="text-[12px] text-[hsl(220,10%,28%)]">Search projects...</span>
            <span className="ml-auto text-[10px] text-[hsl(220,10%,22%)] border border-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</span>
          </div>

          <div className="flex-1" />

          <button className="p-1.5 text-[hsl(220,10%,32%)] hover:text-foreground transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#6C8EFF]" />
          </button>
        </header>

        <div className="p-5 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

/**
 * Dashboard Layout
 * 
 * Provides the shell for the dashboard application.
 * Enforces authentication and provides common UI elements like top navigation.
 * 
 * @security PROTECTED - Requires authentication
 */

import { requireAuth } from '@/backend/Http/Middleware/AuthMiddleware';
import Link from 'next/link';
import { UserMenu } from '@/resources/components/layout/UserMenu';
import { Layers } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce authentication
  const user = await requireAuth();

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl z-50">
        <div className="w-full h-full px-4 sm:px-8 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                <span className="text-lg">⚗️</span>
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:block">Catalyst</span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Right: Quick Actions & User */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center pr-4 border-r border-white/10 gap-2">
                 <button className="p-2 text-slate-400 hover:text-white transition-colors">
                     <Layers className="w-5 h-5" />
                 </button>
            </div>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-4 sm:px-8 w-full">
        {children}
      </main>
    </div>
  );
}


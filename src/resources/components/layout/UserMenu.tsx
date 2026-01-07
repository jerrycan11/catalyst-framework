'use client';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/resources/components/ui/dropdown-menu';
import { logout } from '@/backend/actions/auth';
import { LogOut, Settings, Bell } from 'lucide-react';
import Link from 'next/link';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/5 transition-all outline-none group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm font-medium text-slate-200 leading-none">{user.name.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-500 leading-none mt-1">Admin</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-slate-900/95 backdrop-blur-xl border-white/10 text-slate-200 mt-2">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3 px-1 py-1.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="flex items-center cursor-pointer py-2 w-full">
            <Settings className="mr-3 h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="flex items-center cursor-pointer py-2 w-full">
            <Bell className="mr-3 h-4 w-4 text-slate-400" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem 
          className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer py-2"
          onSelect={(e) => {
            e.preventDefault();
            // Trigger logout form submission
            const form = document.getElementById('logout-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
        >
          <form action={logout} id="logout-form" className="hidden">
            <button type="submit" />
          </form>
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

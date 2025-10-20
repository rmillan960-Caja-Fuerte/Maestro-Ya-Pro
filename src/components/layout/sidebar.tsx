
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AreaChart,
  Box,
  CalendarDays,
  Construction,
  FilePieChart,
  FileText,
  Landmark,
  LayoutGrid,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  UsersRound,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';
import { Button } from '../ui/button';
import { PERMISSIONS, ROLES } from '@/lib/permissions';

const navItems = [
  { href: '/', icon: LayoutGrid, label: 'Dashboard', requiredPermission: null },
  { href: '/clients', icon: UsersRound, label: 'Clientes', requiredPermission: PERMISSIONS.VIEW_CLIENTS },
  { href: '/masters', icon: Construction, label: 'Maestros', requiredPermission: PERMISSIONS.VIEW_MASTERS },
  { href: '/work-orders', icon: FileText, label: 'Órdenes', requiredPermission: PERMISSIONS.VIEW_WORK_ORDERS },
  { href: '/users', icon: Users, label: 'Usuarios', requiredPermission: PERMISSIONS.MANAGE_USERS },
  { href: '/ai', icon: Sparkles, label: 'Asistente IA', requiredPermission: null },
];

export default function AppSidebar({ isMobile = false, userRole }: { isMobile?: boolean, userRole?: string }) {
  const pathname = usePathname();
  
  const userPermissions = (userRole && ROLES[userRole as keyof typeof ROLES]?.permissions) || [];

  const visibleNavItems = navItems.filter(item => {
    if (item.href === '/users') {
        return userRole === 'SUPER_ADMIN';
    }
    // For now, other items are visible if they don't have a specific permission or the user has it.
    // This can be tightened later.
    return !item.requiredPermission || userPermissions.includes(item.requiredPermission);
  });

  const navContent = (
    <nav className="grid gap-1 p-2">
      {visibleNavItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link href={item.href}>
              <button
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary',
                  'w-full justify-start',
                  {
                    'bg-sidebar-accent text-sidebar-primary-foreground': pathname === item.href,
                  }
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className={cn({ 'sr-only': !isMobile })}>{item.label}</span>
              </button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );

  const settingsNav = (
     <nav className="mt-auto grid gap-1 p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/settings">
              <button
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary',
                  'w-full justify-start',
                  {
                    'bg-sidebar-accent text-sidebar-primary-foreground': pathname.startsWith('/settings'),
                  }
                )}
              >
                <Settings className="h-4 w-4" />
                <span className={cn({ 'sr-only': !isMobile })} >Configuración</span>
              </button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            Configuración
          </TooltipContent>
        </Tooltip>
      </nav>
  );

  return (
    <aside className={cn("h-screen bg-sidebar text-sidebar-foreground", { 'hidden sm:flex flex-col border-r border-sidebar-border': !isMobile, 'flex flex-col': isMobile })}>
      <div className="border-b border-sidebar-border p-2">
        <Link href="/" className="flex items-center justify-center gap-2 font-semibold text-lg font-headline">
          <Button variant="outline" size="icon" aria-label="Home" className="bg-sidebar-accent border-sidebar-border hover:bg-sidebar-primary">
            <Logo className="h-5 w-5 text-sidebar-primary-foreground" />
          </Button>
          <span className={cn({'sr-only': !isMobile})}>Maestro-Ya Pro</span>
        </Link>
      </div>
      <TooltipProvider>
        <div className={cn("flex-1 overflow-auto", { 'flex flex-col justify-between': isMobile })}>
          {navContent}
          {isMobile && settingsNav}
        </div>
        {!isMobile && (
          <div className="border-t border-sidebar-border p-2">
            {settingsNav}
          </div>
        )}
      </TooltipProvider>
    </aside>
  );
}

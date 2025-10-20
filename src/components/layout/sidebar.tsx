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

const navItems = [
  { href: '/', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/clients', icon: UsersRound, label: 'Clientes' },
  { href: '/masters', icon: Construction, label: 'Maestros' },
  { href: '/work-orders', icon: FileText, label: 'Órdenes' },
  { href: '/finances', icon: Landmark, label: 'Finanzas' },
  { href: '/analytics', icon: AreaChart, label: 'Analytics' },
  { href: '/schedule', icon: CalendarDays, label: 'Agenda' },
  { href: '/communications', icon: MessageSquare, label: 'Comunicación' },
  { href: '/inventory', icon: Box, label: 'Inventario' },
  { href: '/ai', icon: Sparkles, label: 'Asistente IA' },
  { href: '/reports', icon: FilePieChart, label: 'Reportes' },
];

export default function AppSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  const navContent = (
    <nav className="grid gap-1 p-2">
      {navItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link href={item.href}>
              <button
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  'w-full justify-start',
                  {
                    'bg-muted text-primary': pathname === item.href,
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
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  'w-full justify-start',
                  {
                    'bg-muted text-primary': pathname.startsWith('/settings'),
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
    <aside className={cn("h-screen bg-background", { 'hidden sm:flex flex-col border-r': !isMobile })}>
      <div className="border-b p-2">
        <Link href="/" className="flex items-center justify-center gap-2 font-semibold text-lg font-headline">
          <Button variant="outline" size="icon" aria-label="Home">
            <Logo className="h-5 w-5 fill-current" />
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
          <div className="border-t p-2">
            {settingsNav}
          </div>
        )}
      </TooltipProvider>
    </aside>
  );
}

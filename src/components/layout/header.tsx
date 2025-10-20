'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Search,
  PanelLeft,
  User,
  Settings,
  CreditCard,
  LogOut,
} from 'lucide-react';
import AppSidebar from './sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePathname } from 'next/navigation';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';

export default function AppHeader() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const pathname = usePathname();

  const breadcrumbItems = React.useMemo(() => {
    const pathParts = pathname.split('/').filter(part => part);
    const items = pathParts.map((part, index) => {
      const href = '/' + pathParts.slice(0, index + 1).join('/');
      const isLast = index === pathParts.length - 1;
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
      return (
        <React.Fragment key={href}>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage>{name}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={href}>{name}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </React.Fragment>
      );
    });
    return [
      <BreadcrumbItem key="home">
        <BreadcrumbLink asChild>
          <Link href="/">Dashboard</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>,
      ...items,
    ];
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0">
          <AppSidebar isMobile={true} />
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            {userAvatar && (
              <Image
                src={userAvatar.imageUrl}
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden rounded-full"
                data-ai-hint={userAvatar.imageHint}
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/settings/profile" className="flex items-center w-full">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings/billing" className="flex items-center w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Facturación
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings" className="flex items-center w-full">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/login" className="flex items-center w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

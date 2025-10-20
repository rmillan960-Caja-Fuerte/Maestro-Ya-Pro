
'use client';

import * as React from 'react';
import Link from 'next/link';
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
  DropdownMenuGroup,
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
  Badge,
} from 'lucide-react';
import AppSidebar from './sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { doc } from 'firebase/firestore';

export default function AppHeader() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();
  
  const userDocRef = useMemoFirebase(
    () => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  }

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

  const userInitials = userProfile ? `${userProfile.firstName[0]}${userProfile.lastName[0]}` : <User />;

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
            <Avatar>
              <AvatarFallback>
                {isUserLoading || isProfileLoading ? <User /> : userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isUserLoading || isProfileLoading ? (
             <DropdownMenuLabel>Cargando...</DropdownMenuLabel>
          ) : userProfile ? (
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{`${userProfile.firstName} ${userProfile.lastName}`}</p>
                <p className="text-xs leading-none text-muted-foreground">{userProfile.email}</p>
                {userProfile.role && <p className="text-xs leading-none text-muted-foreground font-bold mt-1 uppercase">{userProfile.role.replace('_', ' ')}</p>}
              </div>
            </DropdownMenuLabel>
          ) : (
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Facturación</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <div className="flex items-center w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

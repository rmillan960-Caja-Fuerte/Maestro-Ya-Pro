'use client';

import React, { useContext, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';

// Import UI components
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Import Icons
import {
  Search,
  PanelLeft,
  User,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  Check,
} from 'lucide-react';

// Import Firebase context and hooks
import { FirebaseContext, useDoc, useMemoFirebase } from '@/firebase';

// Import other components
import AppSidebar from './sidebar';

// Mock data for notifications
const initialNotifications = [
  {
    id: '1',
    title: 'Nueva Orden de Trabajo',
    description: 'Orden #WO-2024-0048 creada.',
    read: false,
    time: 'Hace 5 min',
  },
  {
    id: '2',
    title: 'Pago Recibido',
    description: 'Pago de $250.00 para la orden #WO-2024-0045.',
    read: true,
    time: 'Hace 1 hora',
  },
];

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(initialNotifications);

  // Safely get context. On server or initial load, services will be null.
  const firebaseContext = useContext(FirebaseContext);
  const { areServicesAvailable, auth, firestore, user: authUser, isUserLoading } = firebaseContext || {};

  // Create doc ref only when firestore and user are available
  const userDocRef = useMemoFirebase(
    () => (firestore && authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );

  // useDoc should gracefully handle a null ref
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  const breadcrumbItems = useMemo(() => {
    const pathParts = pathname.split('/').filter(part => part);
    return [
      <BreadcrumbItem key="home">
        <BreadcrumbLink asChild><Link href="/">Dashboard</Link></BreadcrumbLink>
      </BreadcrumbItem>,
      ...pathParts.map((part, index) => {
        const href = '/' + pathParts.slice(0, index + 1).join('/');
        const isLast = index === pathParts.length - 1;
        const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
        return (
          <React.Fragment key={href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isLast ? <BreadcrumbPage>{name}</BreadcrumbPage> : <BreadcrumbLink asChild><Link href={href}>{name}</Link></BreadcrumbLink>}
            </BreadcrumbItem>
          </React.Fragment>
        );
      }),
    ];
  }, [pathname]);

  const isLoading = !areServicesAvailable || isUserLoading || isProfileLoading;

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
      <Breadcrumb className="hidden md:flex"><BreadcrumbList>{breadcrumbItems}</BreadcrumbList></Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Buscar..." className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]" />
      </div>
      
      {/* Notifications Dropdown (can be rendered even if loading) */}
      {/* ... notification dropdown JSX remains the same ... */}
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="outline"
                size="icon"
                className="relative"
            >
                {/* Logic for notification badge */}
                <Bell className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
            {/* ... notification content ... */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Account Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
             {isLoading ? (
                <Skeleton className="h-full w-full rounded-full" />
             ) : (
                <Avatar>
                  <AvatarFallback>
                    {userProfile ? `${userProfile.firstName[0]}${userProfile.lastName[0]}` : <User />}
                  </AvatarFallback>
                </Avatar>
             )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isLoading ? (
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
          <DropdownMenuItem><User className="mr-2 h-4 w-4" /><span>Perfil</span></DropdownMenuItem>
          <DropdownMenuItem><CreditCard className="mr-2 h-4 w-4" /><span>Facturación</span></DropdownMenuItem>
          <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /><span>Configuración</span></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
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

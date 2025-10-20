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
  Bell,
  Check,
} from 'lucide-react';
import AppSidebar from './sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { doc } from 'firebase/firestore';

// Mock data for notifications - In a real app, this would come from a state management or a hook
const initialNotifications = [
  {
    id: '1',
    title: 'Nueva Orden de Trabajo',
    description: 'Orden #WO-2024-0048 creada para "Pintura de Oficina".',
    read: false,
    time: 'Hace 5 minutos',
  },
  {
    id: '2',
    title: 'Pago Recibido',
    description: 'Pago de $250.00 para la orden #WO-2024-0045.',
    read: false,
    time: 'Hace 1 hora',
  },
  {
    id: '3',
    title: 'Maestro Verificado',
    description: 'Carlos Gomez ha completado su verificación.',
    read: true,
    time: 'Hace 3 horas',
  },
  {
    id: '4',
    title: 'Cotización Aprobada',
    description: 'El cliente "Constructora XYZ" aprobó la cotización.',
    read: true,
    time: 'Ayer',
  },
];


export default function AppHeader() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const { user: authUser, isUserLoading } = useUser();
  const [notifications, setNotifications] = React.useState(initialNotifications);
  
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
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
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
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  }

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
                className="relative"
            >
                {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                {unreadNotificationsCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
                        <Check className="w-3 h-3 mr-1"/> Marcar como leído
                    </Button>
                )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map(notification => (
                 <DropdownMenuItem key={notification.id} className="flex items-start gap-2">
                     {!notification.read && <span className="h-2 w-2 mt-1.5 rounded-full bg-primary" />}
                     {notification.read && <span className="h-2 w-2 mt-1.5" />}
                    <div className="grid gap-0.5">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                </DropdownMenuItem>
            ))}
             <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Button variant="link" className="w-full h-8 text-sm">Ver todas las notificaciones</Button>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

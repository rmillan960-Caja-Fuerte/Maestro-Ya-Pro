'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  ArrowUpRight,
  ClipboardList,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import type { ChartConfig } from '@/components/ui/chart';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { type WorkOrder } from './(main)/work-orders/data/schema';
import { type Client } from './(main)/clients/data/schema';
import { specialties } from './(main)/masters/data/schema';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfMonth, subMonths, getMonth } from 'date-fns';
import MainLayout from './(main)/layout';


const revenueChartConfig = {
  revenue: {
    label: 'Ingresos',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const ordersChartConfig: ChartConfig = specialties.reduce((acc, specialty, index) => {
  acc[specialty.value] = {
    label: specialty.label,
    color: `hsl(var(--chart-${(index % 5) + 1}))`,
  };
  return acc;
}, { count: { label: 'Órdenes' } } as ChartConfig);


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();

  // Queries
  const workOrdersQuery = useMemoFirebase(() => 
    !firestore || !user ? null : query(collection(firestore, 'work-orders'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc')),
    [firestore, user?.uid]
  );
  const clientsQuery = useMemoFirebase(() => 
    !firestore || !user ? null : query(collection(firestore, 'clients'), where('ownerId', '==', user.uid)),
    [firestore, user?.uid]
  );

  // Data fetching
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useCollection<WorkOrder>(workOrdersQuery);
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsQuery);

  const isLoading = isAuthLoading || (user && (isLoadingWorkOrders || isLoadingClients));

  // Memoized data processing
  const dashboardData = React.useMemo(() => {
    if (!workOrders) return {
        kpi: { monthlyRevenue: 0, activeOrders: 0, conversionRate: 0, averageTicket: 0 },
        recentOrders: [],
        revenueChart: [],
        ordersByCategory: [],
    };

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    const paidThisMonth = workOrders.filter(wo => {
        if (wo.status !== 'paid' || !wo.completionDate) return false;
        const completionDate = wo.completionDate instanceof Timestamp ? wo.completionDate.toDate() : new Date(wo.completionDate);
        return completionDate >= startOfCurrentMonth;
    });

    const monthlyRevenue = paidThisMonth.reduce((acc, wo) => acc + wo.total, 0);

    const activeOrders = workOrders.filter(wo => 
        ['approved', 'scheduled', 'in_progress'].includes(wo.status)
    ).length;

    const completedOrders = workOrders.filter(wo => ['completed', 'paid'].includes(wo.status));
    const averageTicket = completedOrders.length > 0
        ? completedOrders.reduce((acc, wo) => acc + wo.total, 0) / completedOrders.length
        : 0;

    const approvedQuotesCount = workOrders.filter(wo => wo.status !== 'draft' && wo.status !== 'cancelled').length;
    const totalQuotesCount = workOrders.filter(wo => wo.status !== 'draft').length;
    const conversionRate = totalQuotesCount > 0 ? (approvedQuotesCount / totalQuotesCount) * 100 : 0;

    const clientsMap = new Map(clients?.map(c => [c.id, c.type === 'business' ? c.businessName : `${c.firstName} ${c.lastName}`]));
    const recentOrders = workOrders.slice(0, 5).map(wo => ({
      ...wo,
      clientName: clientsMap.get(wo.clientId) || 'Cliente Desconocido',
    }));

    // Revenue Chart Data
    const monthlyRevenueData: { [key: number]: number } = {};
    workOrders.forEach(wo => {
        if (wo.status === 'paid' && wo.completionDate) {
            const completionDate = wo.completionDate instanceof Timestamp ? wo.completionDate.toDate() : new Date(wo.completionDate);
            const month = getMonth(completionDate);
            if (!monthlyRevenueData[month]) {
                monthlyRevenueData[month] = 0;
            }
            monthlyRevenueData[month] += wo.total;
        }
    });

    const revenueChart = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(now, 5 - i);
        const monthIndex = getMonth(date);
        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
        return {
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            revenue: monthlyRevenueData[monthIndex] || 0,
        };
    });

    // Orders by category chart
    const ordersByCategoryMap = new Map<string, number>();
    workOrders.forEach(wo => {
        if (wo.category) {
            ordersByCategoryMap.set(wo.category, (ordersByCategoryMap.get(wo.category) || 0) + 1);
        }
    });

    const ordersByCategory = Array.from(ordersByCategoryMap.entries()).map(([category, count]) => {
      const spec = specialties.find(s => s.value === category);
      return {
        category: spec?.label || category,
        count,
        fill: `var(--color-${category})`,
      }
    });


    return {
        kpi: { monthlyRevenue, activeOrders, conversionRate, averageTicket },
        recentOrders,
        revenueChart,
        ordersByCategory,
    };

  }, [workOrders, clients]);

  const kpiData = [
    { title: 'Ingresos del Mes', value: formatCurrency(dashboardData.kpi.monthlyRevenue), icon: DollarSign, key: 'monthlyRevenue' },
    { title: 'Órdenes Activas', value: dashboardData.kpi.activeOrders, icon: ClipboardList, key: 'activeOrders' },
    { title: 'Tasa de Conversión', value: `${dashboardData.kpi.conversionRate.toFixed(1)}%`, icon: CreditCard, key: 'conversionRate' },
    { title: 'Ticket Promedio', value: formatCurrency(dashboardData.kpi.averageTicket), icon: Activity, key: 'averageTicket' },
  ];

  const content = (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">Actualizado en tiempo real</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Resumen de Ingresos (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
              <BarChart data={dashboardData.revenueChart} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Órdenes por Categoría</CardTitle>
            <CardDescription>Resumen de todas las órdenes</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={ordersChartConfig}
                className="mx-auto aspect-square h-full max-h-[300px]"
              >
              <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie data={dashboardData.ordersByCategory} dataKey="count" nameKey="category" innerRadius="60%">
                      {dashboardData.ordersByCategory.map((entry) => (
                          <Cell key={entry.category} fill={entry.fill} />
                      ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="category" />} />
              </PieChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Órdenes Recientes</CardTitle>
            <CardDescription>
              Un resumen de las últimas órdenes de trabajo.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="ml-auto gap-1">
            <Link href="/work-orders">
              Ver Todas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Nro. Orden
                </TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha Creación</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recentOrders.map((order) => (
                <TableRow key={order.orderNumber}>
                  <TableCell>
                    <div className="font-medium">{order.clientName}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="text-xs" variant="outline">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(order.createdAt, 'short')}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
  
  if (isLoading) {
    return (
      <MainLayout>
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                     <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/2" />
                            <Skeleton className="h-3 w-1/3 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Resumen de Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                         <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Órdenes por Categoría</CardTitle>
                        <CardDescription>Cargando datos...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0 flex items-center justify-center">
                        <Skeleton className="h-[250px] w-[250px] rounded-full" />
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Órdenes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </CardContent>
            </Card>
        </>
      </MainLayout>
    );
  }

  return <MainLayout>{content}</MainLayout>;
}

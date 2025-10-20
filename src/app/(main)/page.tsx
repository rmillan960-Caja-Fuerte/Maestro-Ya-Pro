'use client';

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
import Link from 'next/link';
import type { ChartConfig } from '@/components/ui/chart';

const kpiData = [
  {
    title: 'Ingresos del Mes',
    value: '$45,231.89',
    change: '+20.1% vs mes anterior',
    icon: DollarSign,
  },
  {
    title: 'Órdenes Activas',
    value: '+2350',
    change: '+180.1% vs mes anterior',
    icon: Users,
  },
  {
    title: 'Tasa de Conversión',
    value: '12,234',
    change: '+19% vs mes anterior',
    icon: CreditCard,
  },
  {
    title: 'Ticket Promedio',
    value: '$231.50',
    change: '+5% vs mes anterior',
    icon: Activity,
  },
];

const recentOrders = [
  {
    orderNumber: 'WO-2024-00123',
    client: 'Constructora XYZ',
    date: '2024-05-28',
    total: 2500.0,
    status: 'Completado',
  },
  {
    orderNumber: 'WO-2024-00124',
    client: 'Ana Pérez',
    date: '2024-05-29',
    total: 150.75,
    status: 'En Progreso',
  },
  {
    orderNumber: 'WO-2024-00125',
    client: 'Oficinas Central',
    date: '2024-05-30',
    total: 750.0,
    status: 'Agendado',
  },
  {
    orderNumber: 'WO-2024-00126',
    client: 'Luis Gómez',
    date: '2024-05-30',
    total: 300.0,
    status: 'Cotizado',
  },
  {
    orderNumber: 'WO-2024-00127',
    client: 'Inmobiliaria Futuro',
    date: '2024-05-31',
    total: 12500.0,
    status: 'Facturado',
  },
];

const revenueChartData = [
  { month: 'Enero', revenue: 18600 },
  { month: 'Febrero', revenue: 30500 },
  { month: 'Marzo', revenue: 23700 },
  { month: 'Abril', revenue: 17300 },
  { month: 'Mayo', revenue: 45231 },
  { month: 'Junio', revenue: 41000 },
];

const revenueChartConfig = {
  revenue: {
    label: 'Ingresos',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const ordersChartData = [
    { category: "Plomería", count: 275, fill: "var(--color-plumbing)" },
    { category: "Electricidad", count: 200, fill: "var(--color-electrical)" },
    { category: "Pintura", count: 187, fill: "var(--color-painting)" },
    { category: "Albañilería", count: 173, fill: "var(--color-masonry)" },
    { category: "Otros", count: 90, fill: "var(--color-other)" },
  ]
  
  const ordersChartConfig = {
    count: {
      label: "Órdenes",
    },
    plumbing: {
      label: "Plomería",
      color: "hsl(var(--chart-1))",
    },
    electrical: {
      label: "Electricidad",
      color: "hsl(var(--chart-2))",
    },
    painting: {
      label: "Pintura",
      color: "hsl(var(--chart-3))",
    },
    masonry: {
      label: "Albañilería",
      color: "hsl(var(--chart-4))",
    },
    other: {
      label: "Otros",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
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
            <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
              <BarChart data={revenueChartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Órdenes por Categoría</CardTitle>
            <CardDescription>Mayo - Junio 2024</CardDescription>
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
                  <Pie data={ordersChartData} dataKey="count" nameKey="category" innerRadius="60%">
                      {ordersChartData.map((entry) => (
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
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.orderNumber}>
                  <TableCell>
                    <div className="font-medium">{order.client}</div>
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
                    {order.date}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

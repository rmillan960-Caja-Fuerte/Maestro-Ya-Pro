
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkOrderTable } from './components/work-order-table';
import { columns } from './components/work-order-columns';

// Datos de ejemplo
const sampleWorkOrders = [
  {
    id: "WO-001",
    orderNumber: 'WO-2024-00123',
    clientName: 'Constructora XYZ',
    masterName: 'Juan Plomero',
    status: 'completed',
    total: 2500.00,
    createdAt: new Date('2024-05-28').toISOString(),
  },
  {
    id: "WO-002",
    orderNumber: 'WO-2024-00124',
    clientName: 'Ana Pérez',
    masterName: 'Pedro Electricista',
    status: 'in_progress',
    total: 150.75,
    createdAt: new Date('2024-05-29').toISOString(),
  },
  {
    id: "WO-003",
    orderNumber: 'WO-2024-00125',
    clientName: 'Oficinas Central',
    masterName: 'Luis Albañil',
    status: 'scheduled',
    total: 750.00,
    createdAt: new Date('2024-05-30').toISOString(),
  },
    {
    id: "WO-004",
    orderNumber: 'WO-2024-00126',
    clientName: 'Luis Gómez',
    masterName: 'Mario Pintor',
    status: 'quote_sent',
    total: 300.00,
    createdAt: new Date('2024-05-30').toISOString(),
  },
  {
    id: "WO-005",
    orderNumber: 'WO-2024-00127',
    clientName: 'Inmobiliaria Futuro',
    masterName: 'Juan Plomero',
    status: 'paid',
    total: 12500.00,
    createdAt: new Date('2024-05-31').toISOString(),
  },
];

export default function WorkOrdersPage() {
  const isLoading = false; // Cambiar a true para ver el esqueleto

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes de Trabajo</CardTitle>
        <CardDescription>
          Administra todas las órdenes de trabajo, desde la cotización hasta el pago.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-[250px]" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-[70px]" />
                <Skeleton className="h-8 w-[120px]" />
              </div>
            </div>
            <div className="rounded-md border">
              <div className="space-y-2 p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <WorkOrderTable columns={columns} data={sampleWorkOrders} />
        )}
      </CardContent>
    </Card>
  );
}

    
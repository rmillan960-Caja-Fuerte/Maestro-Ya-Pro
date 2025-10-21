
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase'; // Corrected import
import { AnimatePresence, motion } from 'framer-motion';

import type { WorkOrder } from '../data/schema';
import { statuses } from '../data/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate } from '@/lib/utils';

// Import the new intelligent flow and the tool components
import { ProFlow } from '../components/pro-flow';
import { WorkOrderItems } from '../components/work-order-items';
import { WorkOrderPayments } from '../components/work-order-payments';
import { WorkOrderScheduler } from '../components/work-order-scheduler'; 
import { WorkOrderEvidence } from '../components/work-order-evidence'; 
import { WorkOrderStatusChanger } from '../components/work-order-status-changer';

const stepToComponentMap: Record<string, React.ComponentType<{ workOrder: WorkOrder }>> = {
    "Generación de cotización digital": WorkOrderItems,
    "Pago de anticipo": WorkOrderPayments,
    "Pago final": WorkOrderPayments,
    "Agendamiento de visita": WorkOrderScheduler,
    "Registro de avances (Fotos)": WorkOrderEvidence,
    // Add other mappings here as components are created
};

export default function WorkOrderDetailPage() {
    const params = useParams();
    const { firestore } = useFirebase(); // Corrected usage of useFirebase
    const id = params.id as string;

    const [workOrder, setWorkOrder] = React.useState<WorkOrder | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [activeStep, setActiveStep] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!firestore || !id) return;
        const workOrderRef = doc(firestore, 'work-orders', id);
        const unsubscribe = onSnapshot(workOrderRef, (doc) => {
            if (doc.exists()) {
                 const data = doc.data();
                // Firestore timestamps need to be converted to JS Dates
                const toDate = (ts: any) => ts?.toDate ? ts.toDate() : ts;
                const payments = data.payments?.map((p:any) => ({...p, date: toDate(p.date)})) || [];
                const evidence = data.evidence?.map((e:any) => ({...e, uploadedAt: toDate(e.uploadedAt)})) || [];

                setWorkOrder({ 
                    id: doc.id, 
                    ...data, 
                    createdAt: toDate(data.createdAt), 
                    updatedAt: toDate(data.updatedAt),
                    scheduledDate: toDate(data.scheduledDate),
                    completionDate: toDate(data.completionDate),
                    warrantyEndDate: toDate(data.warrantyEndDate),
                    payments,
                    evidence,
                } as WorkOrder);
            } else {
                setWorkOrder(null);
            } setIsLoading(false);
        });
        return () => unsubscribe();
    }, [firestore, id]);

    const handleStepClick = (stepTitle: string) => {
        setActiveStep(prev => (prev === stepTitle ? null : stepTitle));
    };

    const ActiveComponent = activeStep ? stepToComponentMap[activeStep] : null;
    const statusInfo = workOrder ? statuses.find(s => s.value === workOrder.status) : null;

    if (isLoading) {
        return <div className="p-8"><Skeleton className="h-96 w-full" /></div>; // Simplified loader
    }

    if (!workOrder) {
        return <div className="p-8"><p>Orden de trabajo no encontrada.</p></div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
             <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orden: {workOrder.orderNumber}</h1>
                    <p className="text-muted-foreground">{workOrder.title}</p>
                </div>
                 {statusInfo && (
                    <Badge
                        style={{ backgroundColor: statusInfo.color, color: 'white' }}
                        className={cn('border-transparent', 'whitespace-nowrap', 'text-base', 'py-2', 'px-4', 'rounded-full')}
                    >
                        {statusInfo.icon && <statusInfo.icon className="mr-2 h-4 w-4" />}
                        {statusInfo.label}
                    </Badge>
                )}
            </header>

            {/* Intelligent Flow Control */}
            <ProFlow 
                workOrder={workOrder} 
                activeStep={activeStep}
                onStepClick={handleStepClick}
            />

            {/* Tool Section with Animation */}
            <AnimatePresence>
                {ActiveComponent && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6">
                            <ActiveComponent workOrder={workOrder} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Side Panel for General Info & Status Change */}
            <div className="fixed top-1/2 right-0 -translate-y-1/2 transform">
                 <Card className="w-80 rounded-l-xl rounded-r-none shadow-2xl border-l-4 border-primary">
                    <CardHeader>
                        <CardTitle>Info & Acciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <WorkOrderStatusChanger workOrder={workOrder} />
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Cliente:</span> <span className="font-medium">{workOrder.clientName || 'N/A'}</span></div>
                            <div className="flex justify-between"><span>Maestro:</span> <span className="font-medium">{workOrder.masterName || 'N/A'}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span>Creada:</span> <span className="font-medium">{formatDate(workOrder.createdAt)}</span></div>
                            <div className="flex justify-between"><span>Actualizada:</span> <span className="font-medium">{formatDate(workOrder.updatedAt)}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

'use client';

import * as React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { toast } from 'sonner';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrder, statuses } from '../data/schema';

interface WorkOrderStatusChangerProps {
    workOrder: WorkOrder;
}

export function WorkOrderStatusChanger({ workOrder }: WorkOrderStatusChangerProps) {
    const firestore = useFirestore();
    const [isUpdating, setIsUpdating] = React.useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (!firestore || isUpdating || newStatus === workOrder.status) return;

        setIsUpdating(true);
        const workOrderRef = doc(firestore, 'work-orders', workOrder.id);

        try {
            await updateDoc(workOrderRef, { 
                status: newStatus,
                updatedAt: new Date(), // Manually update the timestamp
            });
            toast.success('Estado actualizado', {
                description: `La orden ahora está en estado: ${statuses.find(s => s.value === newStatus)?.label}`,
            });
        } catch (error) {
            console.error("Error updating status: ", error);
            toast.error('No se pudo actualizar el estado.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className='space-y-2'>
            <span className="text-sm text-muted-foreground">Cambiar Estado</span>
            <Select
                value={workOrder.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                    {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center">
                                <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {status.label}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}


"use client"

import React from 'react';
import { toast } from 'sonner';

import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { WorkOrderForm } from './work-order-form';
import type { Client } from '@/app/(main)/clients/data/schema';
import type { Master } from '@/app/(main)/masters/data/schema';
import type { WorkOrder } from '../data/schema';

// The dialog is now much simpler. It no longer fetches its own data.
// It receives clients and masters as props from its parent component.
interface WorkOrderFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    workOrder?: WorkOrder;
    onWorkOrderSaved: () => void; 
    clients: Client[];
    masters: Master[];
}

export function WorkOrderFormDialog({ 
    isOpen, 
    onOpenChange, 
    workOrder, 
    onWorkOrderSaved, 
    clients, 
    masters 
}: WorkOrderFormDialogProps) {
    
    // The handleFormSuccess function now only needs to call the callbacks.
    const handleFormSuccess = () => {
        onWorkOrderSaved(); 
        onOpenChange(false); 
    };

    // The internal state and useEffect for data fetching have been removed.

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{workOrder?.id ? "Editar Orden de Trabajo" : "Crear Nueva Orden de Trabajo"}</DialogTitle>
                    <DialogDescription>
                        Completa los detalles de la orden de trabajo. Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <WorkOrderForm 
                    clients={clients} 
                    masters={masters} 
                    onFormSubmitSuccess={handleFormSuccess}
                    workOrder={workOrder}
                />
            </DialogContent>
        </Dialog>
    );
}

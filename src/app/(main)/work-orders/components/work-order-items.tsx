'use client';

import * as React from 'react';
import { useFieldArray, Control, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { z } from "zod";
import { workOrderItemSchema } from '../data/schema';

// Define the shape of the form data
const formSchema = z.object({
    items: z.array(workOrderItemSchema)
});
type WorkOrderFormValues = z.infer<typeof formSchema>;

interface WorkOrderItemsProps {
    control: Control<WorkOrderFormValues>;
    register: UseFormRegister<WorkOrderFormValues>;
    watch: UseFormWatch<WorkOrderFormValues>;
}

export function WorkOrderItems({ control, register, watch }: WorkOrderItemsProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const watchItems = watch('items');

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="w-[100px] text-right">Cantidad</TableHead>
                        <TableHead className="w-[150px] text-right">Precio Unit.</TableHead>
                        <TableHead className="w-[150px] text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field, index) => (
                        <TableRow key={field.id}>
                            <TableCell>
                                <Input {...register(`items.${index}.description`)} placeholder="Ej: Mano de obra" />
                            </TableCell>
                            <TableCell>
                                <Input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true, onChange: (e) => e.target.valueAsNumber = e.target.valueAsNumber || 0 })} className="text-right" />
                            </TableCell>
                            <TableCell>
                                <Input type="number" {...register(`items.${index}.unitPrice`, { valueAsNumber: true, onChange: (e) => e.target.valueAsNumber = e.target.valueAsNumber || 0 })} className="text-right" />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {formatCurrency((watchItems?.[index]?.quantity || 0) * (watchItems?.[index]?.unitPrice || 0))}
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                     {fields.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground pt-6 pb-4">
                                Aún no has añadido ítems a la cotización.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
            >
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir Ítem
            </Button>
        </>
    );
}

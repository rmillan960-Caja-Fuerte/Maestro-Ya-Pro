
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { workOrderSchema, statuses } from '../data/schema';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type { Client } from '@/app/(main)/clients/data/schema';
import type { Master } from '@/app/(main)/masters/data/schema';
import { Timestamp } from 'firebase/firestore';

const formSchema = workOrderSchema.omit({ 
    id: true, 
    orderNumber: true, 
    createdAt: true, 
    updatedAt: true,
    clientName: true,
    masterName: true,
});
type FormValues = z.infer<typeof formSchema>;

interface WorkOrderFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (workOrderData: FormValues) => Promise<void>;
  workOrder: z.infer<typeof workOrderSchema> | null;
  clients: Client[];
  masters: Master[];
}

export function WorkOrderFormDialog({ isOpen, onOpenChange, onSave, workOrder, clients, masters }: WorkOrderFormDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch('items');
  
  React.useEffect(() => {
    if (isOpen) {
        const defaultValues: FormValues = workOrder 
        ? {
            ...workOrder,
            scheduledDate: workOrder.scheduledDate ? (workOrder.scheduledDate instanceof Timestamp ? workOrder.scheduledDate.toDate() : new Date(workOrder.scheduledDate)) : undefined,
          }
        : {
            clientId: '',
            title: '',
            status: 'draft',
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
        };
        form.reset(defaultValues);
    }
  }, [isOpen, workOrder, form]);

  React.useEffect(() => {
    const subtotal = items?.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0) || 0;
    const tax = subtotal * 0.16; // Example tax rate
    const total = subtotal + tax;
    form.setValue('subtotal', subtotal);
    form.setValue('tax', tax);
    form.setValue('total', total);
  }, [items, form]);


  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    await onSave(values);
    setIsSaving(false);
  };
  
  const handleItemChange = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const currentItem = form.getValues(`items.${index}`);
    if (currentItem) {
        const quantity = field === 'quantity' ? value : currentItem.quantity;
        const unitPrice = field === 'unitPrice' ? value : currentItem.unitPrice;
        update(index, { ...currentItem, [field]: value, total: quantity * unitPrice });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{workOrder ? `Orden ${workOrder.orderNumber}` : 'Nueva Orden de Trabajo'}</DialogTitle>
          <DialogDescription>
            {workOrder ? 'Edita los detalles de la orden de trabajo.' : 'Rellena los datos para crear una nueva orden.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                {client.type === 'business' ? client.businessName : `${client.firstName} ${client.lastName}`}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="masterId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Maestro Asignado (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Asigna un maestro" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {masters.map((master) => (
                                <SelectItem key={master.id} value={master.id!}>
                                {`${master.firstName} ${master.lastName}`}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Título del Trabajo</FormLabel>
                        <FormControl><Input placeholder="Ej: Pintura de apartamento completo" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Separator className="my-6" />

            <div>
                <h3 className="text-lg font-medium mb-2">Cotización</h3>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr_80px_120px_120px_auto] gap-2 items-start">
                            <FormField
                                control={form.control}
                                name={`items.${index}.description`}
                                render={({ field }) => <FormItem><FormControl><Textarea placeholder="Descripción del item" {...field} rows={1} /></FormControl><FormMessage /></FormItem>}
                            />
                             <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => <FormItem><FormControl><Input type="number" placeholder="Cant." {...field} onChange={e => handleItemChange(index, 'quantity', +e.target.value)} /></FormControl><FormMessage /></FormItem>}
                            />
                            <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => <FormItem><FormControl><Input type="number" placeholder="P. Unitario" {...field} onChange={e => handleItemChange(index, 'unitPrice', +e.target.value)} /></FormControl><FormMessage /></FormItem>}
                            />
                            <div className="flex items-center h-10">
                                <p>{formatCurrency(items?.[index]?.total || 0)}</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>
                 <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Ítem
                </Button>
            </div>

            <div className="flex justify-end mt-4">
                <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(form.getValues('subtotal'))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">IVA (16%):</span>
                        <span>{formatCurrency(form.getValues('tax'))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(form.getValues('total'))}</span>
                    </div>
                </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {workOrder ? 'Guardar Cambios' : 'Crear Orden'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

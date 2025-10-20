
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
import { Loader2, PlusCircle, Trash2, CalendarIcon, Info, DollarSign, Wrench, Image as ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type { Client } from '@/app/(main)/clients/data/schema';
import type { Master } from '@/app/(main)/masters/data/schema';
import { Timestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    defaultValues: {
      clientId: '',
      title: '',
      status: 'draft',
      items: [],
      subtotal: 0,
      tax: 0,
      surcharges: 0,
      total: 0,
      materialsProvidedBy: 'master',
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch('items');
  const surcharges = form.watch('surcharges');
  
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
            surcharges: 0,
            total: 0,
            materialsProvidedBy: 'master',
        };
        form.reset(defaultValues);
    }
  }, [isOpen, workOrder, form]);

  React.useEffect(() => {
    const subtotal = items?.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0) || 0;
    const tax = (subtotal + (surcharges || 0)) * 0.16; // Tax calculated on subtotal + surcharges
    const total = subtotal + (surcharges || 0) + tax;
    form.setValue('subtotal', subtotal);
    form.setValue('tax', tax);
    form.setValue('total', total);
  }, [items, surcharges, form]);


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
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{workOrder ? `Orden ${workOrder.orderNumber}` : 'Nueva Orden de Trabajo'}</DialogTitle>
          <DialogDescription>
            {workOrder ? 'Edita los detalles de la orden de trabajo.' : 'Rellena los datos para crear una nueva orden.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="quote">Cotización</TabsTrigger>
                    <TabsTrigger value="logistics">Logística</TabsTrigger>
                    <TabsTrigger value="evidence">Evidencia</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <TabsContent value="general" className="mt-0">
                         <div className="space-y-4">
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
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título del Trabajo</FormLabel>
                                        <FormControl><Input placeholder="Ej: Pintura de apartamento completo" {...field} /></FormControl>
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
                    </TabsContent>
                    <TabsContent value="quote" className="mt-0">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Ítems de la Cotización</h3>
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

                            <Separator />
                            
                            <FormField
                                control={form.control}
                                name="surcharges"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recargos (Nocturno, Feriado, etc.)</FormLabel>
                                        <FormControl><Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(+e.target.value)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="w-full max-w-sm ml-auto space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>{formatCurrency(form.getValues('subtotal'))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Recargos:</span>
                                    <span>{formatCurrency(form.getValues('surcharges') || 0)}</span>
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
                    </TabsContent>
                    <TabsContent value="logistics" className="mt-0">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="scheduledDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Fecha Agendada</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "w-full pl-3 text-left font-normal",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              format(field.value, "PPP", { locale: es })
                                            ) : (
                                              <span>Selecciona una fecha</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) =>
                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="masterId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Maestro Asignado</FormLabel>
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
                                name="materialsProvidedBy"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Materiales Proveídos Por</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona quién provee los materiales" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="master">Maestro</SelectItem>
                                            <SelectItem value="client">Cliente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="evidence" className="mt-0">
                         <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                            <ImageIcon className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">Próximamente</h3>
                            <p className="mt-2 text-sm">
                                Aquí podrás subir y ver las fotos de evidencia (antes, durante, después)
                                cuando implementemos la subida de archivos a Firebase Storage.
                            </p>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            <DialogFooter className="pt-4 border-t">
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

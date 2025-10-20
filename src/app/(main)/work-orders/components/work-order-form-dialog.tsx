
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
import { specialties } from '../../masters/data/schema';
import { Loader2, PlusCircle, Trash2, CalendarIcon, Banknote, FileDigit, Star, Clock, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Client } from '@/app/(main)/clients/data/schema';
import type { Master } from '@/app/(main)/masters/data/schema';
import { Timestamp } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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
  workOrder: Partial<z.infer<typeof workOrderSchema>> | null;
  clients: Client[];
  masters: Master[];
}

const TAX_RATE = 0.15;
const MATERIAL_MARKUP_RATE = 0.15;

const StarRating = ({ value, onValueChange }: { value: number, onValueChange: (value: number) => void }) => {
    const [hoverValue, setHoverValue] = React.useState<number | undefined>(undefined);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-6 w-6 cursor-pointer transition-colors",
                        (hoverValue || value) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    )}
                    onClick={() => onValueChange(star)}
                    onMouseEnter={() => setHoverValue(star)}
                    onMouseLeave={() => setHoverValue(undefined)}
                />
            ))}
        </div>
    );
};

const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute}`;
});

export function WorkOrderFormDialog({ isOpen, onOpenChange, onSave, workOrder, clients, masters }: WorkOrderFormDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerId: '',
      clientId: '',
      title: '',
      status: 'draft',
      items: [],
      subtotal: 0,
      tax: 0,
      surcharges: 0,
      materialsCost: 0,
      applyTax: false,
      total: 0,
      balance: 0,
      payments: [],
      materialsProvidedBy: 'master',
      rating: 0,
      review: '',
      category: '',
      scheduledTime: '09:00',
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "payments",
  });

  const calculateTotals = React.useCallback(() => {
    const { items, surcharges, materialsProvidedBy, materialsCost, applyTax, payments } = form.getValues();

    const subtotal = items?.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0) || 0;
    
    let materialsTotal = 0;
    if (materialsProvidedBy === 'master' && materialsCost && materialsCost > 0) {
        materialsTotal = materialsCost * (1 + MATERIAL_MARKUP_RATE);
    }

    const baseForTax = subtotal + (surcharges || 0) + materialsTotal;
    const taxAmount = applyTax ? baseForTax * TAX_RATE : 0;
    const total = baseForTax + taxAmount;
    
    const totalPaid = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    const balance = total - totalPaid;

    form.setValue('subtotal', subtotal, { shouldValidate: true });
    form.setValue('tax', taxAmount, { shouldValidate: true });
    form.setValue('total', total, { shouldValidate: true });
    form.setValue('balance', balance, { shouldValidate: true });
  }, [form]);

  const watchedFields = form.watch(['items', 'surcharges', 'materialsProvidedBy', 'materialsCost', 'applyTax', 'payments']);

  React.useEffect(() => {
    calculateTotals();
  }, [watchedFields, calculateTotals]);

  const completionDate = form.watch('completionDate');

  React.useEffect(() => {
    if (isOpen) {
        const defaultValues: FormValues = workOrder 
        ? {
            ...workOrder,
            ownerId: workOrder.ownerId || user?.uid || '',
            clientId: workOrder.clientId || '',
            title: workOrder.title || '',
            status: workOrder.status || 'draft',
            items: workOrder.items || [],
            subtotal: workOrder.subtotal || 0,
            tax: workOrder.tax || 0,
            surcharges: workOrder.surcharges || 0,
            materialsCost: workOrder.materialsCost || 0,
            applyTax: workOrder.applyTax || false,
            total: workOrder.total || 0,
            balance: workOrder.balance || 0,
            scheduledDate: workOrder.scheduledDate ? (workOrder.scheduledDate instanceof Timestamp ? workOrder.scheduledDate.toDate() : new Date(workOrder.scheduledDate)) : undefined,
            scheduledTime: workOrder.scheduledTime || '09:00',
            completionDate: workOrder.completionDate ? (workOrder.completionDate instanceof Timestamp ? workOrder.completionDate.toDate() : new Date(workOrder.completionDate)) : undefined,
            warrantyEndDate: workOrder.warrantyEndDate ? (workOrder.warrantyEndDate instanceof Timestamp ? workOrder.warrantyEndDate.toDate() : new Date(workOrder.warrantyEndDate)) : undefined,
            payments: workOrder.payments?.map(p => ({...p, date: p.date instanceof Timestamp ? p.date.toDate() : new Date(p.date) })) || [],
            rating: workOrder.rating || 0,
            review: workOrder.review || '',
            category: workOrder.category || '',
            evidence: workOrder.evidence || [],
          }
        : {
            ownerId: user?.uid || '',
            clientId: '',
            title: '',
            status: 'draft',
            items: [],
            subtotal: 0,
            tax: 0,
            surcharges: 0,
            materialsCost: 0,
            applyTax: false,
            total: 0,
            balance: 0,
            payments: [],
            materialsProvidedBy: 'master',
            rating: 0,
            review: '',
            category: '',
            scheduledTime: '09:00',
            evidence: [],
        };
        form.reset(defaultValues);
    }
  }, [isOpen, workOrder, form, user]);

  React.useEffect(() => {
    if (completionDate) {
      const newWarrantyEndDate = addDays(new Date(completionDate), 90);
      form.setValue('warrantyEndDate', newWarrantyEndDate);
    } else {
      form.setValue('warrantyEndDate', undefined);
    }
  }, [completionDate, form]);


  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    await onSave(values);
    setIsSaving(false);
  };
  
  const handleItemBlur = (index: number) => {
    const currentItem = form.getValues(`items.${index}`);
    if (currentItem) {
        const quantity = currentItem.quantity || 0;
        const unitPrice = currentItem.unitPrice || 0;
        update(index, { ...currentItem, total: quantity * unitPrice });
    }
    calculateTotals();
  };

  const handleAddPayment = () => {
    // Simple implementation for now. A more complex one might use another dialog.
    const amount = parseFloat(prompt('Monto del pago:') || '0');
    if(amount > 0) {
      appendPayment({
        amount,
        date: new Date(),
        method: 'Efectivo', // Default, could be a select
        type: 'other'
      });
      toast({ title: 'Pago registrado', description: 'El pago ha sido añadido a la lista.' });
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{workOrder?.orderNumber ? `Orden ${workOrder.orderNumber}` : 'Nueva Orden de Trabajo'}</DialogTitle>
          <DialogDescription>
            {workOrder?.orderNumber ? 'Edita los detalles de la orden de trabajo.' : 'Rellena los datos para crear una nueva orden.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-full grid grid-cols-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="quote">Cotización</TabsTrigger>
                    <TabsTrigger value="logistics">Logística</TabsTrigger>
                    <TabsTrigger value="payments">Pagos</TabsTrigger>
                    <TabsTrigger value="evidence">Evidencia</TabsTrigger>
                    <TabsTrigger value="review">Valoración</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <TabsContent value="general" className="mt-0 space-y-4">
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Cliente</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Categoría de Servicio</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {specialties.map((spec) => (
                                        <SelectItem key={spec.value} value={spec.value}>
                                            {spec.label}
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
                    </TabsContent>
                    <TabsContent value="quote" className="mt-0 space-y-4">
                         <div>
                            <h3 className="text-lg font-medium mb-2">Ítems de Servicio</h3>
                            <div className="grid grid-cols-[1fr_80px_120px_120px_auto] gap-x-2 items-center mb-1 px-1">
                                <Label>Descripción</Label>
                                <Label>Cant.</Label>
                                <Label>P. Unitario</Label>
                                <Label className="text-right">Total</Label>
                                <span className="w-8"></span>
                            </div>
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_80px_120px_120px_auto] gap-x-2 items-start">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.description`}
                                            render={({ field }) => <FormItem className="w-full"><FormControl><Textarea placeholder="Descripción del item" {...field} rows={1} /></FormControl><FormMessage /></FormItem>}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => <FormItem><FormControl><Input type="number" placeholder="Cant." {...field} onBlur={() => handleItemBlur(index)} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unitPrice`}
                                            render={({ field }) => <FormItem><FormControl><Input type="number" placeholder="P. Unitario" {...field} onBlur={() => handleItemBlur(index)} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>}
                                        />
                                        <div className="flex items-center h-10 justify-end">
                                            <p>{formatCurrency(form.getValues(`items.${index}.total`) || 0)}</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive h-10 w-10" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
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
                                <span className="text-muted-foreground">Subtotal Servicios:</span>
                                <span>{formatCurrency(form.getValues('subtotal'))}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Recargos:</span>
                                <span>{formatCurrency(form.getValues('surcharges') || 0)}</span>
                            </div>
                            {form.getValues('materialsProvidedBy') === 'master' && (
                              <div className="flex justify-between">
                                  <span className="text-muted-foreground">Materiales (+15%):</span>
                                  <span>{formatCurrency((form.getValues('materialsCost') || 0) * (1 + MATERIAL_MARKUP_RATE))}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                                <FormField
                                    control={form.control}
                                    name="applyTax"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel className="font-normal text-muted-foreground">Aplicar IVA (15%)</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <span>{formatCurrency(form.getValues('tax'))}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(form.getValues('total'))}</span>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="logistics" className="mt-0 space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Agendamiento</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="scheduledDate"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de Inicio</FormLabel>
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
                                            selected={field.value as Date | undefined}
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
                                    name="scheduledTime"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Hora de Inicio</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <Clock className="mr-2 h-4 w-4 opacity-50"/>
                                                <SelectValue placeholder="Selecciona una hora" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-lg">Asignación y Materiales</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
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
                                                <SelectItem value="master">Maestro (Empresa)</SelectItem>
                                                <SelectItem value="client">Cliente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.getValues('materialsProvidedBy') === 'master' && (
                                    <FormField
                                        control={form.control}
                                        name="materialsCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Costo de Materiales (sin recargo)</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="0.00" 
                                                        {...field} 
                                                        onChange={e => field.onChange(+e.target.value)} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Cierre y Garantía</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="completionDate"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de Finalización</FormLabel>
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
                                                format(new Date(field.value), "PPP", { locale: es })
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
                                            selected={field.value as Date | undefined}
                                            onSelect={field.onChange}
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
                                    name="warrantyEndDate"
                                    render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fin de Garantía (90 días)</FormLabel>
                                        <Input value={field.value ? format(new Date(field.value), "PPP", { locale: es }) : 'Se calculará al finalizar'} disabled />
                                    </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="payments" className="mt-0 space-y-4">
                        <div className='grid grid-cols-3 gap-4 text-center'>
                           <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-4'>
                                <h4 className='text-sm font-medium text-muted-foreground'>Total Orden</h4>
                                <p className='text-2xl font-bold'>{formatCurrency(form.getValues('total'))}</p>
                           </div>
                           <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-4'>
                                <h4 className='text-sm font-medium text-muted-foreground'>Total Pagado</h4>
                                <p className='text-2xl font-bold text-green-600'>{formatCurrency(form.getValues('payments')?.reduce((acc, p) => acc + p.amount, 0) || 0)}</p>
                           </div>
                           <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-4'>
                                <h4 className='text-sm font-medium text-muted-foreground'>Saldo Pendiente</h4>
                                <p className='text-2xl font-bold text-destructive'>{formatCurrency(form.getValues('balance'))}</p>
                           </div>
                        </div>

                        <Separator/>

                        <div>
                            <div className='flex justify-between items-center mb-2'>
                                <h3 className="text-lg font-medium">Historial de Pagos</h3>
                                <Button type="button" size="sm" onClick={handleAddPayment}>
                                    <Banknote className="mr-2 h-4 w-4" /> Registrar Pago
                                </Button>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentFields.length > 0 ? paymentFields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>{formatDate(form.getValues(`payments.${index}.date`) as Date, 'short')}</TableCell>
                                                <TableCell>{form.getValues(`payments.${index}.method`)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(form.getValues(`payments.${index}.amount`))}</TableCell>
                                                <TableCell>
                                                     <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removePayment(index)}><Trash2 className="h-4 w-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className='text-center text-muted-foreground h-24'>Aún no se han registrado pagos.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <Separator />

                        <div className='space-y-2'>
                             <h3 className="text-lg font-medium">Generar Recibos</h3>
                             <div className='flex gap-4'>
                                <Button type='button' variant='outline' disabled>
                                    <FileDigit className="mr-2 h-4 w-4" /> Generar Recibo Anticipo (30%)
                                </Button>

                                <Button type='button' variant='outline' disabled>
                                    <FileDigit className="mr-2 h-4 w-4" /> Generar Recibo Final
                                </Button>
                             </div>
                             <p className='text-xs text-muted-foreground'>Esta funcionalidad estará disponible próximamente.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="evidence" className="mt-0">
                         <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                            <Upload className="mx-auto h-12 w-12" />
                            <h3 className="mt-4 text-lg font-semibold">Subir Evidencia</h3>
                             <p className="mt-2 text-sm">
                                Arrastra y suelta las imágenes del trabajo aquí, o haz clic para seleccionarlas.
                            </p>
                             <p className="mt-1 text-xs text-muted-foreground">
                                Las imágenes de Antes, Durante y Después aparecerán en galerías separadas.
                            </p>
                            <Button type="button" variant="outline" className="mt-4">
                                <Upload className="mr-2 h-4 w-4" />
                                Seleccionar Archivos
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="review" className="mt-0 space-y-4">
                         <div className="p-4 border rounded-lg">
                            <h3 className="text-lg font-medium mb-4">Valoración del Cliente</h3>
                            <div className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calificación (de 1 a 5 estrellas)</FormLabel>
                                            <FormControl>
                                                <StarRating value={field.value || 0} onValueChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="review"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Comentarios del Cliente</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Ej: El maestro fue muy profesional y el trabajo quedó excelente." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                Registra aquí la valoración proporcionada por el cliente una vez finalizado el trabajo.
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
                {workOrder?.id ? 'Guardar Cambios' : 'Crear Orden'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

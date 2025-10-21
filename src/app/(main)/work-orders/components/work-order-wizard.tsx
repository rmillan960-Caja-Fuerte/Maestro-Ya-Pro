
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
import { workOrderSchema } from '../data/schema';
import { specialties } from '../../masters/data/schema';
import { Loader2, PlusCircle, Trash2, Wand2, MessageSquare, UserPlus } from 'lucide-react';
import type { Client } from '@/app/(main)/clients/data/schema';
import type { Master } from '@/app/(main)/masters/data/schema';
import { useUser } from '@/firebase';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ClientFormDialog } from '@/app/(main)/clients/components/client-form-dialog';

const formSchema = workOrderSchema.partial();
type FormValues = z.infer<typeof formSchema>;

interface WorkOrderWizardProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (workOrderData: any) => Promise<void>;
  workOrder: Partial<z.infer<typeof workOrderSchema>> | null;
  clients: Client[];
  masters: Master[];
  onClientCreated: (newClient: Client) => void;
}

const TAX_RATE = 0.15;
const MATERIAL_MARKUP_RATE = 0.15;
const TOTAL_STEPS = 5; // 1. General, 2. Quote, 3. Send, 4. Schedule, 5. Finalize

export function WorkOrderWizard({ isOpen, onOpenChange, onSave, workOrder, clients, masters, onClientCreated }: WorkOrderWizardProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [aiMessage, setAiMessage] = React.useState('');
  const [isClientFormOpen, setIsClientFormOpen] = React.useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
        status: 'draft',
        items: [],
        surcharges: 0,
        materialsCost: 0,
        applyTax: false,
        subtotal: 0,
        tax: 0,
        total: 0,
        materialsProvidedBy: 'master',
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateTotals = React.useCallback(() => {
    const { items, surcharges, materialsProvidedBy, materialsCost, applyTax } = form.getValues();
    const subtotal = items?.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0) || 0;
    let materialsTotal = 0;
    if (materialsProvidedBy === 'master' && materialsCost && materialsCost > 0) {
        materialsTotal = materialsCost * (1 + MATERIAL_MARKUP_RATE);
    }
    const baseForTax = subtotal + (surcharges || 0) + materialsTotal;
    const taxAmount = applyTax ? baseForTax * TAX_RATE : 0;
    const total = baseForTax + taxAmount;

    form.setValue('subtotal', subtotal, { shouldDirty: true });
    form.setValue('tax', taxAmount, { shouldDirty: true });
    form.setValue('total', total, { shouldDirty: true });
  }, [form]);

  React.useEffect(() => {
    if (isOpen) {
        const defaultValues = {
            clientId: workOrder?.clientId || '',
            title: workOrder?.title || '',
            category: workOrder?.category || '',
            status: workOrder?.status || 'draft',
            items: workOrder?.items || [],
            surcharges: workOrder?.surcharges || 0,
            materialsCost: workOrder?.materialsCost || 0,
            applyTax: workOrder?.applyTax || false,
            materialsProvidedBy: workOrder?.materialsProvidedBy || 'master',
            subtotal: workOrder?.subtotal || 0,
            tax: workOrder?.tax || 0,
            total: workOrder?.total || 0,
        };
        form.reset(defaultValues);
        if(workOrder) {
            setTimeout(() => calculateTotals(), 0);
        }
        setStep(1);
        setAiMessage('');
    }
  }, [isOpen, workOrder, form, calculateTotals]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    await onSave(values);
    setIsSaving(false);
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
        fieldsToValidate = ['clientId', 'title', 'category'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
        setStep(s => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  const handleItemChange = (index: number) => {
    const currentItem = form.getValues(`items.${index}`);
    if (currentItem) {
        const quantity = currentItem.quantity || 0;
        const unitPrice = currentItem.unitPrice || 0;
        update(index, { ...currentItem, total: quantity * unitPrice });
    }
    calculateTotals();
  };

  const selectedClientId = form.watch('clientId');
  const selectedClient = React.useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  const generateAIMessage = () => {
      if (!selectedClient) {
          toast({ variant: 'destructive', title: 'Error', description: 'Bug: Por favor, selecciona un cliente primero.' });
          return;
      }

      const formValues = form.getValues();
      const clientName = selectedClient.type === 'business' ? selectedClient.businessName : `${selectedClient.firstName} ${selectedClient.lastName}`;

      const itemsBreakdown = formValues.items?.map(item => 
          `- ${item.quantity}x ${item.description} @ ${formatCurrency(item.unitPrice || 0)} = ${formatCurrency(item.total || 0)}`
      ).join('\n') || 'No hay ítems definidos.';

      const message = `
*PROPUESTA DE SERVICIO - Maestro-Ya Pro*
${workOrder?.orderNumber ? `Orden de Trabajo #${workOrder.orderNumber}` : ''}

Estimado/a ${clientName},

Junto con saludar, y en respuesta a tu solicitud, te presentamos la propuesta de servicio para el trabajo de "*${formValues.title}*."

*DESGLOSE DE SERVICIOS*
${itemsBreakdown}

*RESUMEN FINANCIERO*
Subtotal: ${formatCurrency(formValues.subtotal)}
${formValues.applyTax ? `IVA (${TAX_RATE * 100}%): ${formatCurrency(formValues.tax)}` : ''}
*Total General: ${formatCurrency(formValues.total)}*

*SIGUIENTES PASOS*
Para aprobar esta propuesta y agendar la ejecución del trabajo, por favor realiza el pago del adelanto correspondiente al 40% del total: *${formatCurrency((formValues.total || 0) * 0.4)}*.

*NUESTRO COMPROMISO*
En Maestro-Ya Pro nos comprometemos con la calidad y la satisfacción del cliente. Esta política busca ofrecer un respaldo justo y transparente a todos los trabajos realizados a través de nuestra plataforma.

Quedamos a tu completa disposición para cualquier consulta o modificación.

Atentamente,
El equipo de Maestro-Ya Pro
      `.trim().replace(/^  +/gm, '');

      setAiMessage(message);
      toast({ title: 'Mensaje Profesional Generado', description: 'La propuesta de servicio para tu cliente está lista.' });
  }

  const handleSendWhatsApp = () => {
    if (!selectedClient?.primaryPhone) {
        toast({ variant: 'destructive', title: 'Error', description: 'El cliente no tiene un número de teléfono registrado.' });
        return;
    }
    if (!aiMessage) {
        toast({ variant: 'destructive', title: 'Error', description: 'Primero genera un mensaje con la IA.' });
        return;
    }

    const phoneNumber = selectedClient.primaryPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(aiMessage)}`;
    window.open(whatsappUrl, '_blank');
  }
  
  const handleClientSaved = (newClient: Client) => {
      onClientCreated(newClient);
      form.setValue('clientId', newClient.id, { shouldValidate: true });
      setIsClientFormOpen(false);
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{workOrder?.orderNumber ? `Orden ${workOrder.orderNumber}` : 'Nueva Orden de Trabajo (Asistente)'}</DialogTitle>
          <DialogDescription>
            Sigue los pasos para crear o actualizar una orden de trabajo de forma guiada.
          </DialogDescription>
        </DialogHeader>
        
        <Progress value={(step / TOTAL_STEPS) * 100} className="w-full" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col overflow-hidden">
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {step === 1 && (
                 <div>
                  <h3 className="text-lg font-medium mb-4">Paso 1: Información General</h3>
                  <div className="space-y-4">
                    <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <div className="flex gap-2">
                            <FormField
                                control={form.control}
                                name="clientId"
                                rules={{ required: 'Por favor, selecciona un cliente.'}}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un cliente" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id!} value={client.id!}>
                                            {client.type === 'business' ? client.businessName : `${client.firstName} ${client.lastName}`}
                                            </SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsClientFormOpen(true)}>
                                <UserPlus className="h-4 w-4"/>
                            </Button>
                        </div>
                        <FormMessage>{form.formState.errors.clientId?.message}</FormMessage>
                    </FormItem>
                    <FormField
                        control={form.control}
                        name="title"
                        rules={{ required: 'El título es obligatorio.'}}
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
                        rules={{ required: 'La categoría es obligatoria.'}}
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
                  </div>
                </div>
              )}

              {step === 2 && (
                 <div>
                    <h3 className="text-lg font-medium mb-4">Paso 2: Cotización</h3>
                    <div>
                        <h4 className="text-md font-medium mb-2">Ítems de Servicio</h4>
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
                                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => <FormItem className="w-full"><FormControl><Textarea placeholder="Descripción del item" {...field} rows={1} onBlur={() => handleItemChange(index)}/></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <FormItem><FormControl><Input type="number" placeholder="Cant." {...field} onBlur={() => handleItemChange(index)} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>} />
                                    <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => <FormItem><FormControl><Input type="number" placeholder="P. Unitario" {...field} onBlur={() => handleItemChange(index)} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>} />
                                    <div className="flex items-center h-10 justify-end"><p>{formatCurrency(form.getValues(`items.${index}.total`) || 0)}</p></div>
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive h-10 w-10" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ description: '', quantity: 1, unitPrice: 0, total: 0 })}><PlusCircle className="mr-2 h-4 w-4" />Añadir Ítem</Button>
                    </div>
                    <Separator className="my-6"/>
                    <div className="w-full max-w-sm ml-auto space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal Servicios:</span><span>{formatCurrency(form.watch('subtotal'))}</span></div>
                        <div className="flex justify-between items-center">
                            <FormField control={form.control} name="applyTax" render={({ field }) => (<FormItem className="flex flex-row items-center gap-2 space-y-0"><FormControl><Switch checked={field.value} onCheckedChange={(val) => {field.onChange(val); calculateTotals();}} /></FormControl><FormLabel className="font-normal text-muted-foreground">Aplicar IVA ({TAX_RATE * 100}%)</FormLabel></FormItem>)} />
                            <span>{formatCurrency(form.watch('tax'))}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{formatCurrency(form.watch('total'))}</span></div>
                    </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Paso 3: Enviar Cotización al Cliente</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button type="button" onClick={generateAIMessage} className="w-full"><Wand2 className="mr-2 h-4 w-4"/>Generar Mensaje con IA</Button>
                        <Button type="button" onClick={handleSendWhatsApp} variant="secondary" className="w-full bg-green-500 hover:bg-green-600 text-white"><MessageSquare className="mr-2 h-4 w-4"/>Enviar por WhatsApp</Button>
                    </div>
                    <div>
                        <Label htmlFor="ai-message" className="mb-2 block">Mensaje Generado:</Label>
                        <Textarea id="ai-message" value={aiMessage} onChange={(e) => setAiMessage(e.target.value)} rows={15} placeholder="Haz clic en 'Generar Mensaje' o escribe tu propio mensaje aquí."/>
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            <DialogFooter className="pt-4 border-t">
                <div className='flex justify-between w-full'>
                    <div>
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={prevStep}>
                                Anterior
                            </Button>
                        )}
                    </div>
                    <div>
                        {step < TOTAL_STEPS && (
                             <Button type="button" onClick={nextStep}>
                                Siguiente
                            </Button>
                        )}
                        {step === TOTAL_STEPS && (
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {workOrder?.id ? 'Guardar Cambios' : 'Finalizar y Crear Orden'}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <ClientFormDialog 
        isOpen={isClientFormOpen} 
        onOpenChange={setIsClientFormOpen} 
        onClientSaved={handleClientSaved} 
        client={null}
    />
  </>
  );
}

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import type { WorkOrder } from '../data/schema';

// Schema now only validates the fields needed for scheduling
const schedulerSchema = z.object({
    scheduledDate: z.date({ required_error: 'Debes seleccionar una fecha.' }),
    scheduledTime: z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
});

type SchedulerFormValues = z.infer<typeof schedulerSchema>;

interface WorkOrderSchedulerProps {
    workOrder: WorkOrder;
    disabled?: boolean; // Keep disabled prop for potential future use
}

export function WorkOrderScheduler({ workOrder, disabled = false }: WorkOrderSchedulerProps) {
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<SchedulerFormValues>({
        resolver: zodResolver(schedulerSchema),
        defaultValues: {
            // Use existing scheduled date and time if available
            scheduledDate: workOrder.scheduledDate ? new Date(workOrder.scheduledDate as any) : undefined,
            scheduledTime: workOrder.scheduledTime || '09:00',
        },
    });

    // When the work order prop changes, reset the form with the new data
    React.useEffect(() => {
        form.reset({
            scheduledDate: workOrder.scheduledDate ? new Date(workOrder.scheduledDate as any) : undefined,
            scheduledTime: workOrder.scheduledTime || '09:00',
        });
    }, [workOrder, form]);


    const onSchedule = async (data: SchedulerFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);

        const { scheduledDate, scheduledTime } = data;
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        
        const finalDateTime = new Date(scheduledDate);
        finalDateTime.setHours(hours, minutes);

        const workOrderRef = doc(firestore, 'work-orders', workOrder.id);

        try {
            // The component's only responsibility is to update the date and time fields.
            // It no longer changes the work order's status.
            await updateDoc(workOrderRef, {
                scheduledDate: Timestamp.fromDate(finalDateTime),
                scheduledTime: scheduledTime,
                updatedAt: Timestamp.now(),
            });
            toast.success('Fecha de Agendamiento Actualizada', {
                description: `La orden fue programada para el ${format(finalDateTime, "PPP 'a las' p")}`,
            });
        } catch (error) {
            console.error("Error scheduling work order: ", error);
            toast.error('Error al actualizar la fecha.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className={cn(disabled && 'bg-muted/50')}>
            <CardHeader>
                <CardTitle>Agendar Trabajo</CardTitle>
                <CardDescription>Selecciona o actualiza la fecha y hora para realizar el servicio.</CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={form.handleSubmit(onSchedule)} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !form.watch('scheduledDate') && "text-muted-foreground"
                                    )}
                                    disabled={disabled}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.watch('scheduledDate') ? format(form.watch('scheduledDate'), "PPP") : <span>Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={form.watch('scheduledDate')}
                                    onSelect={(date) => form.setValue('scheduledDate', date!)}
                                    initialFocus
                                    disabled={disabled}
                                />
                            </PopoverContent>
                        </Popover>

                        <Input
                            type="time"
                            {...form.register('scheduledTime')}
                            disabled={disabled}
                        />
                    </div>
                     {form.formState.errors.scheduledDate && <p className="text-sm text-destructive">{form.formState.errors.scheduledDate.message}</p>}
                     {form.formState.errors.scheduledTime && <p className="text-sm text-destructive">{form.formState.errors.scheduledTime.message}</p>}
                    
                    <Button type="submit" disabled={disabled || isSubmitting} className="w-full">
                        {isSubmitting ? 'Guardando...' : 'Guardar Fecha de Agendamiento'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

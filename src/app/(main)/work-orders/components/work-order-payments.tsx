'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DollarSign } from 'lucide-react';

import { WorkOrder, workOrderPaymentSchema } from '../data/schema';
import { formatCurrency, formatDate } from '@/lib/utils';

// We only need a subset of fields for the form
const paymentFormSchema = workOrderPaymentSchema.omit({ id: true, date: true, type: true });
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface WorkOrderPaymentsProps {
    workOrder: WorkOrder;
}

export function WorkOrderPayments({ workOrder }: WorkOrderPaymentsProps) {
    const firestore = useFirestore();
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues: {
            amount: 0,
            method: 'transfer',
            reference: ''
        },
    });

    const advanceAmount = workOrder.total * 0.4;
    const paymentsTotal = workOrder.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    const balance = workOrder.total - paymentsTotal;

    const onAddPayment = async (data: PaymentFormValues) => {
        if (!firestore) return;
        const workOrderRef = doc(firestore, 'work-orders', workOrder.id);

        const newPayment = {
            ...data,
            date: Timestamp.now(),
            type: paymentsTotal === 0 ? 'advance' : 'other',
        };

        try {
            await updateDoc(workOrderRef, {
                payments: arrayUnion(newPayment),
                balance: workOrder.total - (paymentsTotal + data.amount),
                updatedAt: Timestamp.now(),
            });
            toast.success('Pago registrado correctamente.');
            form.reset();
        } catch (error) {
            console.error("Error adding payment: ", error);
            toast.error('Error al registrar el pago.');
        }
    };

    return (
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>Gestión de Pagos</CardTitle>
                <CardDescription>Registra los pagos recibidos para esta orden.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-center">
                    <div className="p-2 rounded-md bg-muted">
                        <div className="text-sm text-muted-foreground">Total Orden</div>
                        <div className="text-lg font-bold">{formatCurrency(workOrder.total)}</div>
                    </div>
                    <div className="p-2 rounded-md bg-muted">
                        <div className="text-sm text-muted-foreground">Anticipo (40%)</div>
                        <div className={cn("text-lg font-bold", paymentsTotal < advanceAmount && 'text-destructive')}>{formatCurrency(advanceAmount)}</div>
                    </div>
                     <div className="p-2 rounded-md bg-muted">
                        <div className="text-sm text-muted-foreground">Total Pagado</div>
                        <div className="text-lg font-bold text-green-600">{formatCurrency(paymentsTotal)}</div>
                    </div>
                    <div className="p-2 rounded-md bg-muted">
                        <div className="text-sm text-muted-foreground">Saldo Restante</div>
                        <div className="text-lg font-bold">{formatCurrency(balance)}</div>
                    </div>
                </div>

                <Separator className='my-6'/>

                <form onSubmit={form.handleSubmit(onAddPayment)} className="space-y-4">
                    <h3 class="text-md font-medium">Registrar Nuevo Pago</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input type="number" placeholder="Monto" {...form.register('amount', { valueAsNumber: true })} className="flex-1"/>
                        <Select onValueChange={(value) => form.setValue('method', value)} defaultValue={form.getValues('method')}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Método..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="transfer">Transferencia</SelectItem>
                                <SelectItem value="cash">Efectivo</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="Referencia (Opcional)" {...form.register('reference')} className="flex-1"/>
                        <Button type="submit">Registrar Pago</Button>
                    </div>
                     {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
                </form>

                <Separator className='my-6'/>
                
                <h3 class="text-md font-medium mb-2">Historial de Pagos</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Referencia</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workOrder.payments && workOrder.payments.length > 0 ? (
                            workOrder.payments.map((payment, index) => (
                                <TableRow key={index}>
                                    <TableCell>{formatDate(payment.date)}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>{payment.method}</TableCell>
                                    <TableCell>{payment.reference || 'N/A'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No se han registrado pagos.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            </CardContent>
        </Card>
    );
}

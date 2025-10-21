"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { addDoc, collection, doc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { workOrderSchema, priorities, statuses } from "../data/schema"
import { Client } from "@/app/(main)/clients/data/schema"
import { Master } from "@/app/(main)/masters/data/schema"
import { useFirestore } from "@/firebase"
import { useUser } from "@/firebase/provider"

const formSchema = workOrderSchema.pick({
    title: true,
    clientId: true,
    masterId: true,
    priority: true,
    description: true,
    status: true,
})

interface WorkOrderFormProps {
    clients: Client[];
    masters: Master[];
    onFormSubmitSuccess: () => void;
    workOrder?: z.infer<typeof workOrderSchema>; 
}

export function WorkOrderForm({ clients, masters, onFormSubmitSuccess, workOrder }: WorkOrderFormProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: workOrder ? {
            title: workOrder.title,
            clientId: workOrder.clientId,
            masterId: workOrder.masterId || "",
            priority: workOrder.priority,
            description: workOrder.description || "",
            status: workOrder.status,
        } : {
            title: "",
            clientId: "",
            masterId: "",
            priority: "medium",
            description: "",
            status: "draft",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast.error("Debes iniciar sesión para realizar esta acción.");
            return;
        }

        if (!firestore) {
            toast.error("Servicio de base de datos no disponible. Inténtalo de nuevo.");
            return;
        }

        try {
            if (workOrder) {
                // Update existing work order
                const workOrderRef = doc(firestore, "work-orders", workOrder.id);
                await updateDoc(workOrderRef, {
                    ...values,
                    updatedAt: new Date(),
                });
                toast.success("Orden de trabajo actualizada con éxito.");
            } else {
                // Create new work order
                await addDoc(collection(firestore, "work-orders"), {
                    ...values,
                    ownerId: user.uid,
                    orderNumber: `OT-${Date.now()}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    subtotal: 0,
                    surcharges: 0,
                    tax: 0,
                    total: 0,
                    balance: 0,
                    items: [],
                    payments: [],
                });
                toast.success("Orden de trabajo creada con éxito.");
            }
            onFormSubmitSuccess();
        } catch (error) {
            console.error("Error saving work order: ", error);
            toast.error("Ocurrió un error al guardar la orden de trabajo.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Instalación de aire acondicionado" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id!}>
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
                                <FormLabel>Maestro Asignado</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un maestro" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {masters.map(master => (
                                            <SelectItem key={master.id} value={master.id!}>
                                                {`${master.firstName} ${master.lastName}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Opcional. Puedes asignarlo más tarde.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prioridad</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una prioridad" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {priorities.map(p => (
                                            <SelectItem key={p.value} value={p.value}>
                                                <div className="flex items-center">
                                                    <p.icon className="w-4 h-4 mr-2"/>
                                                    {p.label}
                                                </div>
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
                                            <SelectValue placeholder="Selecciona un estado inicial" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {statuses.map(s => (
                                            <SelectItem key={s.value} value={s.value}>
                                                <div className="flex items-center">
                                                    <s.icon className="w-4 h-4 mr-2"/>
                                                    {s.label}
                                                </div>
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Describe el trabajo a realizar..."
                                className="resize-none"
                                {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Opcional. Detalles adicionales sobre la orden de trabajo.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit">
                        {workOrder ? "Actualizar Orden" : "Guardar Orden"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

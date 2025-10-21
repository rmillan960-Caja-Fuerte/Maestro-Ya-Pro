
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirestore, useUser } from '@/firebase';
import { useToast } from "@/hooks/use-toast";
import { clientSchema, statuses, types } from '../data/schema';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from 'lucide-react';

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClientSaved: (client: ClientFormValues) => void;
  client: Partial<ClientFormValues> | null;
}

export function ClientFormDialog({ isOpen, onOpenChange, onClientSaved, client }: ClientFormDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || { type: 'individual', status: 'active' },
  });

  const clientType = form.watch("type");

  React.useEffect(() => {
    if (isOpen) {
      form.reset(client || { type: 'individual', status: 'active', ownerId: user?.uid });
    }
  }, [isOpen, client, form, user]);

  const handleSaveClient = async (values: ClientFormValues) => {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "Debes estar autenticado para guardar un cliente." });
        return;
    }
    
    setIsSaving(true);
    try {
      if (client?.id) {
        // Update existing client
        const clientRef = doc(firestore, "clients", client.id);
        await setDoc(clientRef, { ...values, ownerId: user.uid }, { merge: true });
        toast({ title: "Cliente actualizado", description: "Los datos del cliente han sido actualizados." });
        onClientSaved({ ...values, id: client.id });
      } else {
        // Create new client
        const newClientRef = collection(firestore, "clients");
        const addedDoc = await addDoc(newClientRef, { ...values, ownerId: user.uid, createdAt: serverTimestamp() });
        toast({ title: "Cliente creado", description: "El nuevo cliente ha sido creado con éxito." });
        onClientSaved({ ...values, id: addedDoc.id });
      }
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      console.error("Error saving client: ", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el cliente. Inténtalo de nuevo." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{client?.id ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {client?.id ? 'Actualiza los datos de tu cliente.' : 'Añade un nuevo cliente a tu lista.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveClient)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Tipo de Cliente</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            {types.map((type) => (
                                <FormItem key={type.value} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value={type.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{type.label}</FormLabel>
                                </FormItem>
                            ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {clientType === 'individual' ? (
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apellido</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                ) : (
                    <FormField control={form.control} name="businessName" render={({ field }) => (<FormItem><FormLabel>Razón Social</FormLabel><FormControl><Input placeholder="ACME Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                )}
                 <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="cliente@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="primaryPhone" render={({ field }) => (<FormItem><FormLabel>Teléfono Principal</FormLabel><FormControl><Input placeholder="+123456789" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Guardando...' : 'Guardar Cliente'}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

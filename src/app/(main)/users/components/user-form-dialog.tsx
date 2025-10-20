
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { userProfileSchema } from '../data/schema';
import { Loader2 } from 'lucide-react';
import { ROLES } from '@/lib/permissions';
import { allCountries } from '../../masters/data/zones';
import { Switch } from '@/components/ui/switch';

const formSchema = userProfileSchema.omit({ uid: true, createdAt: true, permissions: true });
type FormValues = z.infer<typeof formSchema>;

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (userData: FormValues, password?: string) => Promise<void>;
  user: z.infer<typeof userProfileSchema> | null;
}

export function UserFormDialog({ isOpen, onOpenChange, onSave, user }: UserFormDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'OPERATOR',
      country: 'EC',
      isActive: true,
    },
  });

  const selectedRole = form.watch('role');

  React.useEffect(() => {
    if (isOpen) {
      if (user) {
        form.reset({
            ...user,
            country: user.country || undefined, // Handle null/undefined for OWNER
        });
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          role: 'OPERATOR',
          country: 'EC',
          isActive: true,
        });
      }
    }
  }, [isOpen, user, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    // For simplicity, we are not handling password change for existing users in this form.
    // That would typically be a separate, more secure process.
    // We'll only handle password for new users.
    const password = user ? undefined : (document.getElementById('password') as HTMLInputElement)?.value;
    
    const dataToSave = {
        ...values,
        country: selectedRole === 'OWNER' ? undefined : values.country,
    }
    
    await onSave(dataToSave, password);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {user ? 'Actualiza la información del usuario.' : 'Rellena los datos para crear un nuevo miembro del equipo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl><Input placeholder="Ana" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl><Input placeholder="García" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="usuario@ejemplo.com" {...field} disabled={!!user} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!user && (
                 <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" placeholder="Mínimo 6 caracteres" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ROLES).filter(([key]) => key !== 'OWNER').map(([key, role]) => (
                        <SelectItem key={key} value={key}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedRole !== 'OWNER' && (
                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>País</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona un país" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {allCountries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                {country.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Usuario Activo</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

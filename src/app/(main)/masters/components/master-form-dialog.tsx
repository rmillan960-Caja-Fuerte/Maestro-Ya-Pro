
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
import { masterBaseSchema, statuses, specialties } from '../data/schema';
import { quitoZones } from '../data/zones';
import { Loader2, X, FilePlus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formSchema = masterBaseSchema.omit({ id: true });
type FormValues = z.infer<typeof formSchema>;

interface MasterFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (masterData: FormValues) => Promise<void>;
  master: z.infer<typeof masterBaseSchema> | null;
}

export function MasterFormDialog({ isOpen, onOpenChange, onSave, master }: MasterFormDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const { user } = useUser();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialties: [],
      coverageZones: [],
      status: 'pending_verification',
      documents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  React.useEffect(() => {
    if (isOpen) {
      if (master) {
        form.reset(master);
      } else {
        form.reset({
          ownerId: user?.uid || '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          specialties: [],
          coverageZones: [],
          status: 'pending_verification',
          documents: [],
        });
      }
    }
  }, [isOpen, master, form, user]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    await onSave(values);
    setIsSaving(false);
  };

  const currentSpecialties = form.watch('specialties') || [];
  const currentZones = form.watch('coverageZones') || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{master ? 'Editar Maestro' : 'Añadir Maestro'}</DialogTitle>
          <DialogDescription>
            {master ? 'Actualiza la información del profesional.' : 'Rellena los datos para crear un nuevo maestro.'}
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
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>
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
                    <Input type="email" placeholder="maestro@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="55-1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidades</FormLabel>
                  <Select onValueChange={(value) => {
                      if(value && !currentSpecialties.includes(value)) {
                          form.setValue('specialties', [...currentSpecialties, value])
                      }
                  }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona especialidades" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec.value} value={spec.value} disabled={currentSpecialties.includes(spec.value)}>
                          {spec.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 pt-2">
                      {currentSpecialties.map(specValue => {
                          const specLabel = specialties.find(s => s.value === specValue)?.label;
                          return (
                            <Badge key={specValue} variant="secondary">
                                {specLabel}
                                <button type="button" className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => form.setValue('specialties', currentSpecialties.filter(s => s !== specValue))}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                          )
                      })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverageZones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zonas de Cobertura (Quito)</FormLabel>
                  <Select onValueChange={(value) => {
                      if(value && !currentZones.includes(value)) {
                          form.setValue('coverageZones', [...currentZones, value])
                      }
                  }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona las zonas que cubre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {quitoZones.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value} disabled={currentZones.includes(zone.value)}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 pt-2">
                      {currentZones.map(zoneValue => {
                          const zoneLabel = quitoZones.find(z => z.value === zoneValue)?.label;
                          return (
                            <Badge key={zoneValue} variant="secondary">
                                {zoneLabel}
                                <button type="button" className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => form.setValue('coverageZones', currentZones.filter(s => s !== zoneValue))}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                          )
                      })}
                  </div>
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

            <Separator />

            <div>
              <FormLabel>Documentos</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                     <div className="grid grid-cols-2 gap-2 flex-1">
                        <FormField
                            control={form.control}
                            name={`documents.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Ej: Cédula profesional" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`documents.${index}.url`}
                            render={({ field }) => (
                                <FormItem>
                                     <div className="relative">
                                        <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="https://..." {...field} className="pl-8"/>
                                        </FormControl>
                                     </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                     </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ name: '', url: '' })}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Añadir Documento
                </Button>
              </div>
            </div>
            
            <DialogFooter className="pt-4 sticky bottom-0 bg-background z-10">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {master ? 'Guardar Cambios' : 'Crear Maestro'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

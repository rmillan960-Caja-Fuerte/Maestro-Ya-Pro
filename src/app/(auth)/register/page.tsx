
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDocs, collection, query, limit } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { ROLES } from '@/lib/permissions';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'El nombre es obligatorio.' }),
  lastName: z.string().min(1, { message: 'El apellido es obligatorio.' }),
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type FormValues = z.infer<typeof formSchema>;

async function isFirstUser(db: any): Promise<boolean> {
    if (!db) return false;
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const isFirst = await isFirstUser(firestore);
      
      const roleToSet = isFirst ? 'SUPER_ADMIN' : 'OPERATOR';

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userRef = doc(firestore, 'users', user.uid);
      const roleInfo = ROLES[roleToSet as keyof typeof ROLES];

      if (!roleInfo) {
        throw new Error(`Configuración de rol no encontrada para ${roleToSet}.`);
      }
      
      const userData = {
        uid: user.uid,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: roleToSet,
        permissions: roleInfo.permissions,
        createdAt: serverTimestamp(),
        isActive: true,
        photoUrl: `https://avatar.vercel.sh/${values.email}.png`
      };

      await setDoc(userRef, userData);
      
      toast({
        title: 'Registro exitoso',
        description: `Tu cuenta de ${roleInfo.name} ha sido creada. Serás redirigido.`,
      });
      
      router.push('/');

    } catch (error: any) {
      console.error('Error signing up:', error);
      
      let description = 'No se pudo crear tu cuenta. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este correo electrónico ya está en uso. Intenta iniciar sesión.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error de registro',
        description,
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="mx-auto">
        <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Logo className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-bold text-primary">Maestro-Ya Pro</CardTitle>
            </div>
          <CardDescription>
            Crea tu cuenta para empezar a gestionar tu negocio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="nombre@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Cuenta
                </Button>
              </form>
            </Form>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="underline">
          Inicia Sesión
        </Link>
      </div>
    </div>
  );
}

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

// This function checks if there are any users in the 'users' collection.
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
      // 1. Check if this will be the first user in the database.
      const isFirst = await isFirstUser(firestore);
      const finalRole = isFirst ? 'SUPER_ADMIN' : 'OPERATOR';
      
      // 2. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 3. Create user profile in Firestore with the determined role
      const userRef = doc(firestore, 'users', user.uid);
      const roleInfo = ROLES[finalRole as keyof typeof ROLES];

      if (!roleInfo) {
        throw new Error(`Configuración de rol no encontrada para ${finalRole}.`);
      }
      
      await setDoc(userRef, {
        uid: user.uid,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: finalRole,
        permissions: roleInfo.permissions,
        createdAt: serverTimestamp(),
        isActive: true,
        photoUrl: `https://avatar.vercel.sh/${values.email}.png`
      });

      // IMPORTANT: In a real production app, a Cloud Function triggered on user creation
      // would be used to set the custom claim. For this prototype, this will be handled
      // by a separate manual script.
      if (finalRole === 'SUPER_ADMIN') {
        toast({
          title: '¡Super Admin Creado!',
          description: `Tu cuenta ha sido creada. En el siguiente paso, te ayudaremos a configurar tus superpoderes.`,
        });
      } else {
        toast({
            title: 'Registro exitoso',
            description: `Tu cuenta de ${roleInfo.name} ha sido creada. Serás redirigido.`,
        });
      }

      router.push('/');
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      let description = 'No se pudo crear tu cuenta. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este correo electrónico ya está en uso. Intenta iniciar sesión o usa un correo diferente.';
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

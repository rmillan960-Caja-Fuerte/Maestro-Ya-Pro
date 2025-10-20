
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

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
      // 1. Check if any user exists to determine if this is the first registration.
      const usersCollection = collection(firestore, 'users');
      const existingUsersSnapshot = await getDocs(usersCollection);
      const isFirstUser = existingUsersSnapshot.empty;

      const userRole = isFirstUser ? 'OWNER' : 'OPERATOR';
      
      // WARNING: This is a temporary admin action for prototyping.
      // In a real production app, user creation and especially role/claim assignment
      // MUST be handled by a secure backend function (e.g., a Cloud Function).
      // Creating users on the client and trying to assign roles is insecure.
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const newUser = userCredential.user;

      const roleInfo = ROLES[userRole as keyof typeof ROLES];
      
      // 2. Create the user's profile in Firestore
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        uid: newUser.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: userRole,
        isActive: true,
        createdAt: serverTimestamp(),
        permissions: roleInfo.permissions,
      });

      // 3. IMPORTANT: Set Custom Claim for the user role.
      // This CANNOT be done from the client-side SDK. It requires a backend (e.g., Cloud Function).
      // We are logging a warning to make this clear. Without this step, the security rules
      // that rely on `request.auth.token.role` will fail for this new user.
      if (isFirstUser) {
        console.warn(
          `********************************************************************************\n` +
          `** ACTION REQUIRED: OWNER role needs to be set via Custom Claims. **\n` +
          `** Cannot be done from client. Use a backend function to set claim: **\n` +
          `** { role: 'OWNER' } for user ${newUser.uid}                               **\n` +
          `********************************************************************************`
        );
      }

      toast({
        title: '¡Cuenta Creada!',
        description: `Bienvenido, ${values.firstName}. Se te ha asignado el rol de ${userRole}.`,
      });
      router.push('/');

    } catch (error: any) {
      console.error('Error during registration:', error);

      let description = 'No se pudo crear la cuenta. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este correo electrónico ya está registrado.';
      } else if (error.code === 'auth/weak-password') {
        description = 'La contraseña es demasiado débil.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error de Registro',
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
                <CardTitle className="text-3xl font-bold text-primary">Crear Cuenta</CardTitle>
            </div>
          <CardDescription>
            Únete a Maestro-Ya Pro. El primer usuario será el Dueño (Owner).
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
                        <Input type="password" {...field} />
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

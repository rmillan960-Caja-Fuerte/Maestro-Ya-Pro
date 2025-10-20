'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

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

// This is a simplified check. In a real app, this might be a call to a Cloud Function
// that checks a protected collection of existing users.
async function isFirstUser(db: any): Promise<boolean> {
  const querySnapshot = await db.collection('users').limit(1).get();
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
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
        .catch(async (error) => {
          // If user already exists, we might be trying to fix their role.
          if (error.code === 'auth/email-already-in-use' && values.email === 'rmillan960@gmail.com') {
            toast({
              title: 'Cuenta existente',
              description: 'Actualizando rol para el Super Admin...',
            });
            // We need to sign in to get the user object to proceed with role update
            return signInWithEmailAndPassword(auth, values.email, values.password);
          }
          // If it's a different error or a different user, re-throw it.
          throw error;
        });

      const user = userCredential.user;

      // 2. Create or OVERWRITE user profile in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      
      // The very first registered user is always a SUPER_ADMIN.
      // Or, if it's the specific hardcoded super admin email, force the role.
      const userDoc = await getDoc(userRef);
      const isFirst = !userDoc.exists(); // Simple check: is this the first time we're setting this doc?

      let finalRole = 'OPERATOR'; // Default role
      if (isFirst || values.email === 'rmillan960@gmail.com') {
        finalRole = 'SUPER_ADMIN';
      }

      const roleInfo = ROLES[finalRole as keyof typeof ROLES];

      if (!roleInfo) {
        throw new Error(`Configuración de rol no encontrada para ${finalRole}.`);
      }
      
      // Always set/overwrite the document to ensure permissions are correct.
      await setDoc(userRef, {
        uid: user.uid,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: finalRole,
        permissions: roleInfo.permissions, // Assign all permissions for the role
        createdAt: serverTimestamp(),
        isActive: true,
        photoUrl: `https://avatar.vercel.sh/${values.email}.png`
      }, { merge: true }); // Use merge to avoid overwriting createdAt on re-registration

      toast({
        title: 'Registro exitoso',
        description: `Tu cuenta de ${roleInfo.name} ha sido creada/actualizada.`,
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

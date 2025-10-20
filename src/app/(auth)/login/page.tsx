'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const ensureSuperAdminRole = async (user: { uid: string, email?: string | null }) => {
    if (user.email === 'rmillan960@gmail.com') {
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists() || userDoc.data().role !== 'SUPER_ADMIN') {
        const roleInfo = ROLES.SUPER_ADMIN;
        // This might be the first sign-in, so we set the whole profile
        await setDoc(userRef, { 
          role: 'SUPER_ADMIN', 
          permissions: roleInfo.permissions,
          email: user.email,
          uid: user.uid,
          // Add other necessary fields if they are missing
          firstName: userDoc.data()?.firstName || 'Rafael',
          lastName: userDoc.data()?.lastName || 'Millan',
          createdAt: userDoc.data()?.createdAt || serverTimestamp(),
          isActive: true,
        }, { merge: true });
        console.log('SUPER_ADMIN role ensured for rmillan960@gmail.com');
      }
    }
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      await ensureSuperAdminRole(userCredential.user);

      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de nuevo.',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error signing in:', error);

      let title = 'Error al iniciar sesión';
      let description = 'Las credenciales son incorrectas. Por favor, inténtalo de nuevo.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = 'El correo o la contraseña son incorrectos. Por favor, verifica tus datos.';
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await ensureSuperAdminRole(user);

      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido, ${user.displayName}.`,
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error with Google sign-in:', error);
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: 'No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsGoogleLoading(false);
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
            Bienvenido de nuevo. Inicia sesión en tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <div className="flex items-center">
                         <FormLabel>Contraseña</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline"
                          >
                            ¿Olvidaste tu contraseña?
                          </Link>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar Sesión
                </Button>
              </form>
            </Form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continuar con
                </span>
              </div>
            </div>
             <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.846,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              )}
              Google
            </Button>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm">
        ¿No tienes una cuenta?{' '}
        <Link href="/register" className="underline">
          Regístrate
        </Link>
      </div>
    </div>
  );
}

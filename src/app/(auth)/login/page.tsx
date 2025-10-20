'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
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

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria.' }),
});

type FormValues = z.infer<typeof formSchema>;

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="1em"
        height="1em"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691c2.212-4.123 6.9-7 12.083-7.587l-5.657 5.657c-1.102 1.102-1.742 2.585-1.742 4.142A7.962 7.962 0 0 0 12 24c0 .884.143 1.734.402 2.533l-5.657 5.657A19.921 19.921 0 0 1 4 24c0-3.56.921-6.877 2.533-9.694l-.227-.215z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.046 35.668 27.268 37 24 37c-3.556 0-6.758-1.539-8.944-4.004l-5.657 5.657C14.135 42.023 18.832 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.657 5.657C41.812 35.216 44 30.021 44 24c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
    );
  }

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

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de nuevo.',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error signing in:', error);

      let title = 'Error al iniciar sesión';
      let description = 'Las credenciales son incorrectas. Por favor, inténtalo de nuevo.';

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        try {
          const signInMethods = await fetchSignInMethodsForEmail(auth, values.email);
          if (signInMethods.includes('google.com')) {
            title = 'Cuenta de Google Detectada';
            description = 'Esta cuenta está registrada con Google. Por favor, usa el botón "Iniciar Sesión con Google".';
          }
        } catch (fetchError) {
          // Si fetchSignInMethodsForEmail falla, usamos el mensaje genérico.
          console.error('Could not fetch sign in methods:', fetchError);
        }
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
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // **SUPER ADMIN ROLE ASSIGNMENT LOGIC**
      // This is the key fix. After a successful Google sign-in, we check the user's email.
      if (user.email === 'rmillan960@gmail.com') {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        const roleToSet = 'SUPER_ADMIN';
        const roleInfo = ROLES[roleToSet];

        if (!userDoc.exists()) {
          // If the user doc doesn't exist, create it with the SUPER_ADMIN role.
          const [firstName, lastName] = user.displayName?.split(' ') || ['Usuario', 'Maestro-Ya'];
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            role: roleToSet,
            permissions: roleInfo.permissions,
            createdAt: serverTimestamp(),
            isActive: true,
            photoUrl: user.photoURL || `https://avatar.vercel.sh/${user.email}.png`
          });
          console.log('Super Admin profile created.');
        } else if (userDoc.data()?.role !== roleToSet) {
          // If the doc exists but the role is not SUPER_ADMIN, update it.
          await setDoc(userRef, { role: roleToSet, permissions: roleInfo.permissions }, { merge: true });
          console.log('Super Admin role has been assigned/verified.');
        }
      }

      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido con tu cuenta de Google.',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error with Google sign in:', error);
       let description = 'No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/popup-closed-by-user') {
        description = 'La ventana de inicio de sesión fue cerrada. Inténtalo de nuevo.';
      }
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión con Google',
        description: description,
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
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Iniciar Sesión con Google
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

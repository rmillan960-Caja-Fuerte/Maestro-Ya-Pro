'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm, useFormState, useFormStatus } from 'react-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseApp } from '@/firebase';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Enviar Enlace de Recuperación
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const firebaseApp = useFirebaseApp(); // Get the initialized Firebase App
  const [isEmailSent, setIsEmailSent] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [pending, setPending] = React.useState(false);


  const handlePasswordReset = async (formData: FormData) => {
    const email = formData.get('email') as string;

    if (!email) {
      setErrorMessage('Por favor, introduce un correo electrónico.');
      return;
    }

    setPending(true);
    setErrorMessage('');

    try {
      const auth = getAuth(firebaseApp);
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      let userFriendlyMessage = 'No se pudo enviar el correo. Por favor, inténtalo de nuevo.';
      if (error.code === 'auth/user-not-found') {
        // For security, we don't reveal if a user exists, so we show a generic success message.
         setIsEmailSent(true); // Pretend it was successful
         return;
      } else if (error.code === 'auth/invalid-email') {
        userFriendlyMessage = 'El formato del correo electrónico no es válido.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: userFriendlyMessage,
      });
    } finally {
      setPending(false);
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
            {isEmailSent 
                ? '¡Revisa tu correo!' 
                : 'Introduce tu correo para recuperar tu contraseña.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isEmailSent ? (
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en breve.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/login">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Iniciar Sesión
                        </Link>
                    </Button>
                </div>
            ) : (
                <form action={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input 
                            id="email"
                            name="email"
                            placeholder="nombre@ejemplo.com"
                            type="email"
                            required
                        />
                         {errorMessage && <p className="text-sm font-medium text-destructive">{errorMessage}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar Enlace de Recuperación
                    </Button>
                </form>
            )}
        </CardContent>
      </Card>
      {!isEmailSent && (
         <div className="mt-4 text-center text-sm">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/login" className="underline">
            Inicia Sesión
            </Link>
        </div>
      )}
    </div>
  );
}

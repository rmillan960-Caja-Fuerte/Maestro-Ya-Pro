'use client';

import * as React from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';

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
import { generatePasswordResetLink } from './actions';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
  const [isEmailSent, setIsEmailSent] = React.useState(false);

  const initialState = { type: '', message: '' };
  const [state, dispatch] = useFormState(generatePasswordResetLink, initialState);

  React.useEffect(() => {
    if (state.message) {
      if (state.type === 'success') {
        setIsEmailSent(true);
      } else { // 'error'
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      }
    }
  }, [state, toast]);

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
                        {state.message}
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/login">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Iniciar Sesión
                        </Link>
                    </Button>
                </div>
            ) : (
                <form action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input 
                            id="email"
                            name="email"
                            placeholder="nombre@ejemplo.com"
                            type="email"
                            required
                        />
                    </div>
                    <SubmitButton />
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

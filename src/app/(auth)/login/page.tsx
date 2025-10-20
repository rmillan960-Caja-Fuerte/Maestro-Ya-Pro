import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

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
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Iniciar Sesión
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>
           <Button variant="outline" className="w-full">
            <GoogleIcon className="mr-2 h-4 w-4" />
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

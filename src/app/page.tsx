import MainLayout from './(main)/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido a Maestro-Ya Pro!</CardTitle>
          <CardDescription>
            La aplicación está cargando correctamente. El siguiente paso es reconstruir el dashboard con datos reales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Hemos aislado el problema que causaba los errores de permisos. Ahora tenemos una base estable para continuar.</p>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

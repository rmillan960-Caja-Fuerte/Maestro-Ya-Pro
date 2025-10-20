import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientsPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Administra los perfiles de tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>El contenido para la gestión de clientes estará aquí.</p>
        </CardContent>
    </Card>
  );
}

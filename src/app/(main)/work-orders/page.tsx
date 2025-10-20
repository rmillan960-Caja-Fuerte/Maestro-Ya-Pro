import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkOrdersPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Órdenes de Trabajo</CardTitle>
            <CardDescription>Administra todas las órdenes de trabajo.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>El contenido para la gestión de órdenes de trabajo estará aquí.</p>
        </CardContent>
    </Card>
  );
}

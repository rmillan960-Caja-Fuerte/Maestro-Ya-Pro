import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>Gestiona tu inventario de materiales y herramientas.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>El contenido para la gestión de inventario estará aquí.</p>
        </CardContent>
    </Card>
  );
}

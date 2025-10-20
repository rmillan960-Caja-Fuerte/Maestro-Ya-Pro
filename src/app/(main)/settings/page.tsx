import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configura tu cuenta y las preferencias de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Las opciones de configuración estarán aquí.</p>
        </CardContent>
    </Card>
  );
}

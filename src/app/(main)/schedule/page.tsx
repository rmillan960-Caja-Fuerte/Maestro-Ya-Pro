import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SchedulePage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Agenda</CardTitle>
            <CardDescription>Gestiona la agenda y disponibilidad de tus maestros.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>El calendario y las herramientas de agendamiento estarán aquí.</p>
        </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteGenerator } from "./quote-generator";

export default function AiPage() {
  return (
    <Card>
      <CardHeader>
          <CardTitle>Creación Inteligente de Cotizaciones</CardTitle>
          <CardDescription>
              Acelera tu flujo de trabajo generando cotizaciones automáticamente a partir de las solicitudes de tus clientes.
          </CardDescription>
      </CardHeader>
      <CardContent>
          <QuoteGenerator />
      </CardContent>
    </Card>
  );
}

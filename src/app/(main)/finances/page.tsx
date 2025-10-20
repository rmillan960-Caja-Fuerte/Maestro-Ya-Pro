import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancesPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Finanzas</CardTitle>
            <CardDescription>Visualiza y administra las finanzas de tu negocio.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>El dashboard y herramientas financieras estarán aquí.</p>
        </CardContent>
    </Card>
  );
}

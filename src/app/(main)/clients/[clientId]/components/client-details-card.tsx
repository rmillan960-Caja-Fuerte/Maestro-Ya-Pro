
import { Client } from "@/app/(main)/clients/data/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building, Mail, Phone, MapPin } from "lucide-react";

interface ClientDetailsCardProps {
    client: Client;
}

export function ClientDetailsCard({ client }: ClientDetailsCardProps) {
    const name = client.type === 'business' ? client.businessName : `${client.firstName} ${client.lastName}`;
    const address = [client.address, client.city, client.state, client.zip, client.country].filter(Boolean).join(', ');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    {client.type === 'business' ? <Building className="mr-2" /> : <User className="mr-2" />}
                    Información del Cliente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="font-medium">{name}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4" /> {client.email || "No registrado"}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" /> {client.primaryPhone}
                    </div>
                    {address && (
                        <div className="flex items-center text-sm text-muted-foreground md:col-span-2">
                            <MapPin className="mr-2 h-4 w-4" /> {address}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

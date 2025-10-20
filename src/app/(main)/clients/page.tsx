import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

import { columns } from './components/client-columns';
import { ClientTable } from './components/client-table';
import { clientSchema } from './data/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Simulate a database read for tasks.
async function getClients() {
  const data = await fs.readFile(
    path.join(process.cwd(), 'src/app/(main)/clients/data/clients.json')
  );

  const clients = JSON.parse(data.toString());

  return z.array(clientSchema).parse(clients);
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>
          Administra tus clientes y visualiza su información de contacto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientTable columns={columns} data={clients} />
      </CardContent>
    </Card>
  );
}

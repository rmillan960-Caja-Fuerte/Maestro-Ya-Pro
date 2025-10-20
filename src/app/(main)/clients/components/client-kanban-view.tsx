
'use client';

import * as React from 'react';
import { Building, MoreHorizontal, User, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Client, statuses } from '../data/schema';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: Client;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, client: Client) => void;
}

const ClientCard = ({ client, onDragStart }: ClientCardProps) => {
  const name = client.type === 'business' ? client.businessName : `${client.firstName} ${client.lastName}`;
  const Icon = client.type === 'business' ? Building : User;

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, client)}
      className="mb-4 cursor-grab active:cursor-grabbing"
    >
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">{name}</CardTitle>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Crear Orden</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{client.primaryPhone}</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface KanbanColumnProps {
  status: { value: string; label: string };
  clients: Client[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, client: Client) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  isDraggingOver: boolean;
}

const KanbanColumn = ({ status, clients, onDragStart, onDrop, onDragOver, isDraggingOver }: KanbanColumnProps) => (
  <div
    onDrop={(e) => onDrop(e, status.value)}
    onDragOver={onDragOver}
    className={cn("flex-1 rounded-lg bg-muted p-4 transition-colors", {
        "bg-primary/10": isDraggingOver
    })}
  >
    <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">{status.label}</h3>
        <Badge variant="secondary">{clients.length}</Badge>
    </div>
    <div className="min-h-[200px]">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} onDragStart={onDragStart} />
      ))}
    </div>
  </div>
);


interface ClientKanbanViewProps {
  clients: Client[];
  onStatusChange: (clientId: string, newStatus: any) => Promise<void>;
}

export function ClientKanbanView({ clients, onStatusChange }: ClientKanbanViewProps) {
  const [draggedClient, setDraggedClient] = React.useState<Client | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, client: Client) => {
    setDraggedClient(client);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: string) => {
    e.preventDefault();
    if (draggedClient && draggedClient.status !== newStatus) {
      onStatusChange(draggedClient.id, newStatus as any);
    }
    setDraggedClient(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    setDragOverColumn(status);
  };
  
  const handleDragLeave = () => {
    setDragOverColumn(null);
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4" onDragLeave={handleDragLeave}>
      {statuses.map((status) => (
        <KanbanColumn
          key={status.value}
          status={status}
          clients={clients.filter((c) => c.status === status.value)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragOver={(e) => handleDragOver(e, status.value)}
          isDraggingOver={dragOverColumn === status.value}
        />
      ))}
    </div>
  );
}

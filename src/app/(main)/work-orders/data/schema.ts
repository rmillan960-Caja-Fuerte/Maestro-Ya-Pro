
import { z } from "zod"
import { Circle, Clock, FileWarning, Pencil, CheckCircle2, Truck, DollarSign, XCircle } from "lucide-react"
import { Timestamp } from "firebase/firestore"

export const workOrderItemSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida.'),
  quantity: z.number().min(0.1, 'La cantidad debe ser mayor a 0.'),
  unitPrice: z.number().min(0, 'El precio unitario no puede ser negativo.'),
  total: z.number(),
});

export const workOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  clientId: z.string({ required_error: "El cliente es obligatorio." }),
  clientName: z.string().optional(),
  masterId: z.string().optional(),
  masterName: z.string().optional(),
  addressId: z.string().optional(), // Nuevo
  status: z.enum([
      "draft",
      "quote_sent",
      "approved",
      "scheduled",
      "in_progress",
      "completed",
      "paid",
      "cancelled",
    ]),
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().optional(),
  items: z.array(workOrderItemSchema).optional(),
  subtotal: z.number().default(0),
  surcharges: z.number().default(0), // Nuevo para recargos
  tax: z.number().default(0),
  total: z.number().default(0),
  materialsProvidedBy: z.enum(['master', 'client']).default('master'), // Nuevo
  internalNotes: z.string().optional(), // Nuevo
  evidence: z.array(z.object({ url: z.string(), stage: z.enum(['before', 'during', 'after'])})).optional(), // Nuevo
  createdAt: z.union([z.instanceof(Timestamp), z.string()]),
  updatedAt: z.union([z.instanceof(Timestamp), z.string()]).optional(),
  scheduledDate: z.union([z.instanceof(Date), z.string()]).optional(),
  completionDate: z.union([z.instanceof(Date), z.string()]).optional(), // Nuevo
})

export type WorkOrder = z.infer<typeof workOrderSchema>
export type WorkOrderItem = z.infer<typeof workOrderItemSchema>

export const statuses = [
  {
    value: "draft",
    label: "Borrador",
    icon: Pencil,
    variant: "outline",
  },
  {
    value: "quote_sent",
    label: "Cotizado",
    icon: FileWarning,
    variant: "secondary",
  },
  {
    value: "approved",
    label: "Aprobado",
    icon: CheckCircle2,
    variant: "default",
    color: "bg-green-500"
  },
  {
    value: "scheduled",
    label: "Agendado",
    icon: Clock,
    variant: "default",
    color: "bg-blue-500"
  },
  {
    value: "in_progress",
    label: "En Progreso",
    icon: Truck,
    variant: "default",
    color: "bg-yellow-500"
  },
  {
    value: "completed",
    label: "Completado",
    icon: CheckCircle2,
    variant: "default",
    color: "bg-green-700"
  },
  {
    value: "paid",
    label: "Pagado",
    icon: DollarSign,
    variant: "default",
    color: "bg-emerald-500"
  },
    {
    value: "cancelled",
    label: "Cancelado",
    icon: XCircle,
    variant: "destructive",
  },
]

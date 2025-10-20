
import { z } from "zod"
import { Circle, Clock, FileWarning, Pencil, CheckCircle2, Truck, DollarSign, XCircle } from "lucide-react"

export const workOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  clientId: z.string(),
  clientName: z.string(), // This will be enriched data, not in Firestore
  masterId: z.string().optional(),
  masterName: z.string().optional(), // This will be enriched data, not in Firestore
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
  total: z.number(),
  createdAt: z.string(),
})

export type WorkOrder = z.infer<typeof workOrderSchema>

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
  },
  {
    value: "scheduled",
    label: "Agendado",
    icon: Clock,
    variant: "default",
  },
  {
    value: "in_progress",
    label: "En Progreso",
    icon: Truck,
    variant: "default",
  },
  {
    value: "completed",
    label: "Completado",
    icon: CheckCircle2,
    variant: "default",
  },
  {
    value: "paid",
    label: "Pagado",
    icon: DollarSign,
    variant: "default",
  },
    {
    value: "cancelled",
    label: "Cancelado",
    icon: XCircle,
    variant: "destructive",
  },
]

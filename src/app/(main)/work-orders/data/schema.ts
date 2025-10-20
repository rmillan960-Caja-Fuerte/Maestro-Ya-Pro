
import { z } from "zod"
import { Circle, Clock, FileWarning, Pencil, CheckCircle2, Truck, DollarSign, XCircle } from "lucide-react"
import { Timestamp } from "firebase/firestore"

export const workOrderItemSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida.'),
  quantity: z.number().min(0.1, 'La cantidad debe ser mayor a 0.'),
  unitPrice: z.number().min(0, 'El precio unitario no puede ser negativo.'),
  total: z.number(),
});

export const workOrderPaymentSchema = z.object({
  id: z.string().optional(),
  amount: z.number().min(0.1, 'El monto debe ser mayor a 0.'),
  date: z.union([z.instanceof(Timestamp), z.instanceof(Date), z.string()]),
  method: z.string().min(1, 'El método de pago es requerido.'),
  reference: z.string().optional(),
  type: z.enum(['advance', 'final', 'other']).default('other'),
});

export const workOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  clientId: z.string({ required_error: "El cliente es obligatorio." }),
  clientName: z.string().optional(),
  masterId: z.string().optional(),
  masterName: z.string().optional(),
  addressId: z.string().optional(),
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
  surcharges: z.number().default(0),
  materialsCost: z.number().optional().default(0),
  applyTax: z.boolean().default(false),
  tax: z.number().default(0),
  total: z.number().default(0),
  balance: z.number().default(0),
  payments: z.array(workOrderPaymentSchema).optional(),
  materialsProvidedBy: z.enum(['master', 'client']).default('master'),
  internalNotes: z.string().optional(),
  evidence: z.array(z.object({ url: z.string(), stage: z.enum(['before', 'during', 'after'])})).optional(),
  createdAt: z.union([z.instanceof(Timestamp), z.string()]),
  updatedAt: z.union([z.instanceof(Timestamp), z.string()]).optional(),
  scheduledDate: z.union([z.instanceof(Timestamp), z.instanceof(Date), z.string()]).optional(),
  completionDate: z.union([z.instanceof(Timestamp), z.instanceof(Date), z.string()]).optional(),
  warrantyEndDate: z.union([z.instanceof(Timestamp), z.instanceof(Date), z.string()]).optional(),
})

export type WorkOrder = z.infer<typeof workOrderSchema>
export type WorkOrderItem = z.infer<typeof workOrderItemSchema>
export type WorkOrderPayment = z.infer<typeof workOrderPaymentSchema>


export const statuses = [
  {
    value: "draft",
    label: "Borrador",
    icon: Pencil,
    variant: "outline",
    color: "",
  },
  {
    value: "quote_sent",
    label: "Cotizado",
    icon: FileWarning,
    variant: "secondary",
    color: "",
  },
  {
    value: "approved",
    label: "Aprobado",
    icon: CheckCircle2,
    variant: "default",
    color: "bg-green-500",
  },
  {
    value: "scheduled",
    label: "Agendado",
    icon: Clock,
    variant: "default",
    color: "bg-blue-500",
  },
  {
    value: "in_progress",
    label: "En Progreso",
    icon: Truck,
    variant: "default",
    color: "bg-yellow-500",
  },
  {
    value: "completed",
    label: "Completado",
    icon: CheckCircle2,
    variant: "default",
    color: "bg-green-700",
  },
  {
    value: "paid",
    label: "Pagado",
    icon: DollarSign,
    variant: "default",
    color: "bg-emerald-500",
  },
    {
    value: "cancelled",
    label: "Cancelado",
    icon: XCircle,
    variant: "destructive",
    color: "",
  },
]

import { z } from "zod"
import { User, Briefcase, Building } from "lucide-react"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const clientSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  type: z.enum(["individual", "business"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  email: z.string().email(),
  primaryPhone: z.string(),
  status: z.enum(["active", "inactive", "pending"]),
})

export type Client = z.infer<typeof clientSchema>


export const statuses = [
  {
    value: "active",
    label: "Activo",
  },
  {
    value: "inactive",
    label: "Inactivo",
  },
  {
    value: "pending",
    label: "Pendiente",
  },
]

export const types = [
  {
    value: "individual",
    label: "Individual",
    icon: User,
  },
  {
    value: "business",
    label: "Empresa",
    icon: Building,
  },
]


import { z } from "zod"

export const clientSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string(),
  type: z.enum(["individual", "business"]),
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().optional(),
  businessName: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  primaryPhone: z.string().min(1, "El teléfono principal es obligatorio"),
  secondaryPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(["active", "inactive", "lead"]).default("active"),
  createdAt: z.date().optional(),
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
    value: "lead",
    label: "Lead",
  },
]

export const types = [
  {
    value: "individual",
    label: "Particular",
  },
  {
    value: "business",
    label: "Empresa",
  },
]

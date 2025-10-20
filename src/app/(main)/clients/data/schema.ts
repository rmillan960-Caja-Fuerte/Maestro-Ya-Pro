
import { z } from "zod"
import { User, Building } from "lucide-react"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

export const clientBaseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  type: z.enum(["individual", "business"]),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  email: z.string().email({ message: "Por favor, introduce un correo válido." }),
  primaryPhone: z.string().min(1, { message: "El teléfono es obligatorio." }),
  status: z.enum(["active", "inactive", "pending"]),
});

export const clientSchema = clientBaseSchema.refine(data => {
    if (data.type === 'business') {
        return !!data.businessName;
    }
    return !!data.firstName && !!data.lastName;
}, {
    message: "Nombre y apellido son requeridos para clientes individuales, y Razón Social para empresas.",
    path: ["firstName"], // you can specify which field to display the error on
});


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

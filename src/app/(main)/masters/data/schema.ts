
import { z } from "zod"

export const masterBaseSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string(),
  firstName: z.string().min(1, { message: "El nombre es obligatorio." }),
  lastName: z.string().min(1, { message: "El apellido es obligatorio." }),
  email: z.string().email({ message: "Por favor, introduce un correo válido." }),
  phone: z.string().min(1, { message: "El teléfono es obligatorio." }),
  specialties: z.array(z.string()).min(1, { message: "Selecciona al menos una especialidad." }),
  status: z.enum(["active", "inactive", "pending_verification"]),
});

export const masterSchema = masterBaseSchema;
export type Master = z.infer<typeof masterSchema>;


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
    value: "pending_verification",
    label: "Pendiente",
  },
]

export const specialties = [
    { value: 'plumbing', label: 'Plomería' },
    { value: 'electrical', label: 'Electricidad' },
    { value: 'painting', label: 'Pintura' },
    { value: 'masonry', label: 'Albañilería' },
    { value: 'carpentry', label: 'Carpintería' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'gardening', label: 'Jardinería' },
    { value: 'cleaning', label: 'Limpieza' },
];

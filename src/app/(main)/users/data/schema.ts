
import { z } from "zod"
import { Timestamp } from "firebase/firestore"
import { ROLES } from "@/lib/permissions"

export const userProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email({ message: "Por favor, introduce un correo válido." }),
  role: z.string().min(1, { message: "El rol es obligatorio."}),
  permissions: z.array(z.string()).optional(),
  firstName: z.string().min(1, { message: "El nombre es obligatorio." }),
  lastName: z.string().min(1, { message: "El apellido es obligatorio." }),
  photoUrl: z.string().url().optional().nullable(),
  createdAt: z.union([z.instanceof(Timestamp), z.string()]),
  isActive: z.boolean().default(true),
  country: z.string().optional().nullable(),
});

export type UserProfile = z.infer<typeof userProfileSchema>

export const roleOptions = Object.entries(ROLES)
    .filter(([key]) => key !== 'OWNER')
    .map(([key, role]) => ({
        value: key,
        label: role.name,
    }));

export const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

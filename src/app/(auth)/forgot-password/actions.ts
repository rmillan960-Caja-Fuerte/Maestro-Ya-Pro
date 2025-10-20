'use server';

import * as admin from 'firebase-admin';
import { z } from 'zod';

// Initialize Firebase Admin SDK
// This should only be done once. The check ensures it.
if (!admin.apps.length) {
  // We need to retrieve the service account credentials.
  // In a real production environment, these would be set as environment variables.
  // For this prototype, we'll assume they are available.
  // This part of the code is conceptual and might need adjustment based on deployment environment.
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
     if (process.env.NODE_ENV !== 'development') {
        console.error('Firebase admin initialization error:', error);
     }
  }
}

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
});

export async function generatePasswordResetLink(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Correo electrónico inválido.',
    };
  }

  const { email } = validatedFields.data;

  try {
    // This function generates a link and sends it using the email template configured in your Firebase project.
    await admin.auth().generatePasswordResetLink(email);
    return {
      type: 'success',
      message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en breve.',
    };
  } catch (error: any) {
    // Log the detailed error on the server for debugging
    console.error('Error generating password reset link:', error);

    // We provide a generic message to the user for security reasons.
    // We don't want to confirm whether an email address exists or not.
    return {
      type: 'success', // We still return success to prevent email enumeration
      message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en breve.',
    };
  }
}

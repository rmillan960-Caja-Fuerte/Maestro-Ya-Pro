'use server';
// This file is no longer used for the client-side password reset flow.
// It is kept to avoid breaking imports if it were referenced elsewhere,
// but its functionality is now handled directly on the client.
// In a real project, this could be safely deleted if no other server-side
// logic depends on it.

export async function generatePasswordResetLink(prevState: any, formData: FormData) {
  // This server action is deprecated.
  console.warn("generatePasswordResetLink server action is deprecated and should not be used.");
  return {
    type: 'error',
    message: 'This feature has been moved to the client.',
  };
}

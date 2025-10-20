
'use server';

import { firestore } from '@/firebase/index.ts';
import { doc, setDoc } from 'firebase/firestore';
import { ROLES } from './permissions';

const usersToSeed = [
  {
    uid: 'CEPY0l00v2MkmCAdMPikfP0gL9i1',
    email: 'rmillan960@gmail.com',
    role: 'SUPER_ADMIN',
    firstName: 'Ricardo',
    lastName: 'Millan'
  },
  {
    uid: 'BVx6g4z5DCecWThXxSXBQbXPXah1',
    email: 'empleado1@gmail.com',
    role: 'OPERATOR',
    firstName: 'Empleado',
    lastName: 'Uno'
  }
];

export async function seedInitialData() {
  console.log('Verificando y aplicando seeds...');
  
  for (const userData of usersToSeed) {
    try {
      const userRef = doc(firestore, 'users', userData.uid);
      const roleInfo = ROLES[userData.role as keyof typeof ROLES];
      
      if (!roleInfo) {
        console.warn(`Rol '${userData.role}' no encontrado para el usuario ${userData.email}.`);
        continue;
      }

      await setDoc(userRef, {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        permissions: roleInfo.permissions,
        firstName: userData.firstName,
        lastName: userData.lastName,
        photoUrl: `https://avatar.vercel.sh/${userData.email}.png`,
        createdAt: new Date().toISOString(),
        isActive: true,
      }, { merge: true });

      console.log(`Datos iniciales para ${userData.email} aplicados correctamente.`);

    } catch (error) {
      console.error(`Error aplicando datos iniciales para ${userData.email}:`, error);
    }
  }
  
  console.log('Proceso de seed finalizado.');
}

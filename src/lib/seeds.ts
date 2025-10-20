
'use server';

import { initializeFirebase } from '@/firebase/index';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ROLES } from './permissions';
import { generateOrderNumber } from './utils';
import { Timestamp } from 'firebase/firestore';

const { firestore } = initializeFirebase();

const usersToSeed = [
  {
    uid: 'CEPY0l00v2MkmCAdMPikfP0gL9i1',
    email: 'rmillan960@gmail.com',
    role: 'SUPER_ADMIN',
    firstName: 'Rafael',
    lastName: 'Millan'
  }
];

const clientsToSeed = [
    {
      id: "CLI-00001",
      ownerId: "CEPY0l00v2MkmCAdMPikfP0gL9i1",
      type: "business",
      businessName: "Constructora de Ejemplo",
      email: "contacto@constructora.com",
      primaryPhone: "55-1111-2222",
      status: "active"
    },
     {
      id: "CLI-00002",
      ownerId: "CEPY0l00v2MkmCAdMPikfP0gL9i1",
      type: "individual",
      firstName: "Ana",
      lastName: "García",
      email: "ana.garcia@email.com",
      primaryPhone: "55-3333-4444",
      status: "active"
    }
];

const mastersToSeed = [
    {
        id: "MAS-00001",
        ownerId: 'CEPY0l00v2MkmCAdMPikfP0gL9i1',
        firstName: 'Roberto',
        lastName: 'Gómez',
        email: 'roberto.gomez@maestros.com',
        phone: '55-5555-6666',
        specialties: ['plumbing', 'electrical'],
        coverageZones: ['norte', 'centro-historico'],
        rating: 4.8,
        status: 'active',
        documents: [
            { name: 'Cédula Profesional', url: 'https://example.com/cedula-roberto.pdf' }
        ]
    }
];


const workOrdersToSeed = [
    {
        id: "WO-2024-00001",
        ownerId: "CEPY0l00v2MkmCAdMPikfP0gL9i1",
        orderNumber: "WO-2024-00001",
        clientId: "CLI-00001",
        masterId: "MAS-00001",
        status: "completed",
        title: "Reparación de fuga en oficina central",
        total: 1500,
        createdAt: Timestamp.fromDate(new Date('2024-05-10T09:00:00')),
        completionDate: Timestamp.fromDate(new Date('2024-05-11T14:00:00')),
        category: 'plumbing',
        rating: 5,
        review: 'El trabajo fue rápido y muy profesional.'
    },
    {
        id: "WO-2024-00002",
        ownerId: "CEPY0l00v2MkmCAdMPikfP0gL9i1",
        orderNumber: "WO-2024-00002",
        clientId: "CLI-00002",
        status: "quote_sent",
        title: "Instalación de 3 lámparas nuevas",
        total: 850,
        createdAt: Timestamp.now(),
        category: 'electrical',
    }
]

export async function seedInitialData() {
  console.log('Verificando y aplicando seeds...');

  const seedPromises = [];

  // Seed Users
  for (const userData of usersToSeed) {
    const userRef = doc(firestore, 'users', userData.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        const roleInfo = ROLES[userData.role as keyof typeof ROLES];
        if (roleInfo) {
            seedPromises.push(setDoc(userRef, {
                uid: userData.uid,
                email: userData.email,
                role: userData.role,
                permissions: roleInfo.permissions,
                firstName: userData.firstName,
                lastName: userData.lastName,
                photoUrl: `https://avatar.vercel.sh/${userData.email}.png`,
                createdAt: serverTimestamp(),
                isActive: true,
            }));
            console.log(`Usuario ${userData.email} será creado.`);
        }
    }
  }

  // Seed Clients
  for (const clientData of clientsToSeed) {
      const clientRef = doc(firestore, 'clients', clientData.id);
      const clientDoc = await getDoc(clientRef);
      if(!clientDoc.exists()) {
        seedPromises.push(setDoc(clientRef, clientData));
        console.log(`Cliente ${clientData.id} será creado.`);
      }
  }

  // Seed Masters
  for (const masterData of mastersToSeed) {
      const masterRef = doc(firestore, 'masters', masterData.id);
      const masterDoc = await getDoc(masterRef);
      if(!masterDoc.exists()) {
        seedPromises.push(setDoc(masterRef, masterData));
        console.log(`Maestro ${masterData.id} será creado.`);
      }
  }

  // Seed Work Orders
  for (const woData of workOrdersToSeed) {
      const woRef = doc(firestore, 'work-orders', woData.id);
      const woDoc = await getDoc(woRef);
      if(!woDoc.exists()) {
        seedPromises.push(setDoc(woRef, woData));
        console.log(`Orden de trabajo ${woData.id} será creada.`);
      }
  }
  
  if (seedPromises.length > 0) {
      await Promise.all(seedPromises);
      console.log(`${seedPromises.length} documentos han sido sembrados en la base de datos.`);
  } else {
      console.log('No se necesitaron nuevos datos. La base de datos ya está inicializada.');
  }

  console.log('Proceso de seed finalizado.');
  return { success: true, count: seedPromises.length };
}

// Automatically call seed on file load (for server environments)
// This part can be tricky in Next.js. A better approach would be a manual trigger page/API route
// But for this environment, let's try to trigger it from the main page load.

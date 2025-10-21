import { getFirebaseApp } from "./index";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// This file is intended for server-side use.

const app = getFirebaseApp();
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth };
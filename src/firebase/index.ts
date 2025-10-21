import { firebaseConfig } from "@/firebase/config";
import { getApp, getApps, initializeApp } from "firebase/app";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
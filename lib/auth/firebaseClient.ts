"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if we have a config (client side) or if an app is already initialized
const app = getApps().length 
  ? getApp() 
  : firebaseConfig.apiKey 
    ? initializeApp(firebaseConfig) 
    : null;

// Cast to Auth to satisfy type checkers in other files. 
// At runtime (client), app will be defined. 
// At build time (server/static gen), this might be null but won't be used.
export const firebaseAuth = (app ? getAuth(app) : null) as unknown as ReturnType<typeof getAuth>;


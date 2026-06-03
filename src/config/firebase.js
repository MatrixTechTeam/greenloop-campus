// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDK80POGGiqAyujoB4nXPuQrE7jG8ejkuk",
  authDomain: "lordshipnkanta-3f88e.firebaseapp.com",
  projectId: "lordshipnkanta-3f88e",
  storageBucket: "lordshipnkanta-3f88e.firebasestorage.app",
  messagingSenderId: "248338680557",
  appId: "1:248338680557:web:1ecd5ba2bd6496172f9ae4",
  measurementId: "G-CSVJJT43YC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize messaging only if browser supports it
export let messaging = null;
if (typeof window !== 'undefined' && 'Notification' in window) {
  messaging = getMessaging(app);
}

export default app;
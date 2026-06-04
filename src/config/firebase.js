// src/config/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  browserPopupRedirectResolver,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDK80POGGiqAyujoB4nXPuQrE7jG8ejkuk",
  authDomain: "lordshipnkanta-3f88e.firebaseapp.com",
  projectId: "lordshipnkanta-3f88e",
  storageBucket: "lordshipnkanta-3f88e.firebasestorage.app",
  messagingSenderId: "248338680557",
  appId: "1:248338680557:web:1ecd5ba2bd6496172f9ae4",
  measurementId: "G-CSVJJT43YC",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Set persistence to LOCAL (user stays logged in even after closing browser)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Firebase persistence enabled (local)"))
  .catch((error) => console.error("❌ Persistence error:", error));

export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Provider with custom parameters
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;

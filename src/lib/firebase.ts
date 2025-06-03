import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace these values with your actual Firebase configuration from your Firebase Console
// Go to: Project Settings (gear icon) > General > Your Apps > Web App > Config
const firebaseConfig = {
  apiKey: "AIzaSyCLuAFnfJiFsmE0-SJsqAgLbHjmcR5nSX8",
  authDomain: "ecommerse-app-82338.firebaseapp.com",
  projectId: "ecommerse-app-82338",
  storageBucket: "ecommerse-app-82338.firebasestorage.app",
  messagingSenderId: "315571657905",
  appId: "1:315571657905:web:fda85fdb35f66a2bb39690",
  measurementId: "G-W12YZFY9CF"
};


// Initialize Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase auth
export const auth = getAuth(app);

// Optionally enable phone auth debug mode (helps with localhost testing)
// This doesn't fix the app credential issue but makes debugging easier
try {
  // This is a safety net for development environments
  if (window.location.hostname === 'localhost') {
    console.log('Firebase Auth running on localhost - enabling debug mode');
  }
} catch (error) {
  console.error('Error configuring Firebase Auth:', error);
}

// Export Firestore and Storage instances
export const db = getFirestore(app);
export const storage = getStorage(app);
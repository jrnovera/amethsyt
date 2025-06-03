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
  storageBucket: "ecommerse-app-82338.appspot.com",
  messagingSenderId: "315571657905",
  appId: "1:315571657905:web:fda85fdb35f66a2bb39690",
  measurementId: "G-W12YZFY9CF"
};



const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);



export const db = getFirestore(app);
export const storage = getStorage(app);
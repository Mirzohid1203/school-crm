import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmxAnUd0yeNEiiA-m60_wrZ7Qa0L7v9HQ",
  authDomain: "school-crm-db852.firebaseapp.com",
  projectId: "school-crm-db852",
  storageBucket: "school-crm-db852.firebasestorage.app",
  messagingSenderId: "780013874190",
  appId: "1:780013874190:web:1f63d89f0393c44d8e205f"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

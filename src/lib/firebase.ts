import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDHciRDDGpPSL7ZOOV6EmD8pEucYp5AE98",
    authDomain: "wave-app-11f68.firebaseapp.com",
    databaseURL: "https://wave-app-11f68-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wave-app-11f68",
    storageBucket: "wave-app-11f68.firebasestorage.app",
    messagingSenderId: "728721058826",
    appId: "1:728721058826:web:870f86fc44238e0886c3f3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);

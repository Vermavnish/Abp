// firebase-init.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; // Import getStorage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0dQtToOsQD6Luv0YOmeethDO5kyimSKA",
  authDomain: "abpclass-7c802.firebaseapp.com",
  projectId: "abpclass-7c802",
  storageBucket: "abpclass-7c802.firebasestorage.app",
  messagingSenderId: "841554153669",
  appId: "1:841554153669:web:6c9d4d84bf521c531b60ac",
  measurementId: "G-Y8HBFK4EV3" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Storage

export { app, auth, db, storage }; // Export storage as well

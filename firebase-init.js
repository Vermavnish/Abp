// firebase-init.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore for user data storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0dQtToOsQD6Luv0YOmeethDO5kyimSKA",
  authDomain: "abpclass-7c802.firebaseapp.com",
  projectId: "abpclass-7c802",
  storageBucket: "abpclass-7c802.firebasestorage.app",
  messagingSenderId: "841554153669",
  appId: "1:841554153669:web:6c9d4d84bf521c531b60ac",
  measurementId: "G-Y8HBFK4EV3" // Although measurementId is here, getAnalytics isn't imported as it's not directly needed for auth logic here.
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get the Auth service
const db = getFirestore(app); // Get the Firestore service

export { app, auth, db }; // Export them so other files can use them

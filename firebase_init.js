// firebase_init.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js"; // Optional

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkSFTP7cb4i-BzUFbvKNGCMXTCWMOc3gw",
  authDomain: "abptest3-595bb.firebaseapp.com",
  projectId: "abptest3-595bb",
  storageBucket: "abptest3-595bb.firebasestorage.app",
  messagingSenderId: "609413076048",
  appId: "1:609413076048:web:eb0acf7c57909660962d55",
  // measurementId: "G-NG3GBECDEH" // Optional, remove if not using Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// const analytics = getAnalytics(app); // Optional

export { app, auth, db, storage,
         collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where,
         ref, uploadBytes, getDownloadURL, deleteObject
       };

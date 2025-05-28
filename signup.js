// signup.js
import { auth, createUserWithEmailAndPassword } from './firebase_init.js';
import { db, doc, setDoc } from './firebase_init.js'; // Import db and doc for Firestore

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupNameInput = document.getElementById('signupName');
    const signupEmailInput = document.getElementById('signupEmail');
    const signupPasswordInput = document.getElementById('signupPassword');
    const signupMessageDiv = document.getElementById('signupMessage');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = signupNameInput.value;
            const email = signupEmailInput.value;
            const password = signupPasswordInput.value;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Add user data to Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    name: name,
                    email: email,
                    role: 'student', // Default role for new signups
                    assignedBatches: [] // Initialize with empty array
                });

                signupMessageDiv.textContent = 'Signup successful! Redirecting...';
                signupMessageDiv.className = 'alert alert-success';
                signupMessageDiv.style.display = 'block';
                // The onAuthStateChanged listener in app.js will now handle redirection
                // No need for setTimeout or direct redirection here.

            } catch (error) {
                console.error('Signup error:', error);
                signupMessageDiv.textContent = 'Signup failed: ' + error.message;
                signupMessageDiv.className = 'alert alert-danger';
                signupMessageDiv.style.display = 'block';
            }
        });
    }
});

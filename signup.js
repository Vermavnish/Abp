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

                signupMessageDiv.textContent = 'Signup successful! Redirecting to login...';
                signupMessageDiv.className = 'alert alert-success';
                signupMessageDiv.style.display = 'block';
                // Optional: Redirect to login or dashboard
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000); // Redirect after 2 seconds

            } catch (error) {
                console.error('Signup error:', error);
                signupMessageDiv.textContent = 'Signup failed: ' + error.message;
                signupMessageDiv.className = 'alert alert-danger';
                signupMessageDiv.style.display = 'block';
            }
        });
    }
});

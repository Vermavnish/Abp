// login.js
import { auth, signInWithEmailAndPassword } from './firebase_init.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginMessageDiv = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginEmailInput.value;
            const password = loginPasswordInput.value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                loginMessageDiv.textContent = 'Login successful! Redirecting...';
                loginMessageDiv.className = 'alert alert-success';
                loginMessageDiv.style.display = 'block';

                // Check user role and redirect accordingly
                // We'll add user role logic here from app.js later for better centralized control
                // For now, redirect to dashboard by default after successful login
                window.location.href = 'dashboard.html';

            } catch (error) {
                console.error('Login error:', error);
                loginMessageDiv.textContent = 'Login failed: ' + error.message;
                loginMessageDiv.className = 'alert alert-danger';
                loginMessageDiv.style.display = 'block';
            }
        });
    }
});

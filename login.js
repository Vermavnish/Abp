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
                await signInWithEmailAndPassword(auth, email, password);
                // The onAuthStateChanged listener in app.js will now handle redirection
                loginMessageDiv.textContent = 'Login successful! Redirecting...';
                loginMessageDiv.className = 'alert alert-success';
                loginMessageDiv.style.display = 'block';

            } catch (error) {
                console.error('Login error:', error);
                loginMessageDiv.textContent = 'Login failed: ' + error.message;
                loginMessageDiv.className = 'alert alert-danger';
                loginMessageDiv.style.display = 'block';
            }
        });
    }
});

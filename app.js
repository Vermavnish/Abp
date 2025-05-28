// app.js

// Import Firebase services and functions from your init file
import { auth, onAuthStateChanged, signOut, db, collection, getDocs, query, where, doc, getDoc } from './firebase_init.js';

// --- Global Elements and Helper Functions ---

const currentUserSpan = document.getElementById('currentUser');
const authLinks = document.getElementById('authLinks');
const userLinks = document.getElementById('userLinks');
const dashboardLink = document.getElementById('dashboardLink');
const adminLink = document.getElementById('adminLink');
const logoutButton = document.getElementById('logoutButton');

// Function to update navigation based on auth state and user role
async function updateAuthUI(user) {
    if (user) {
        currentUserSpan.textContent = user.email;
        authLinks.style.display = 'none';
        userLinks.style.display = 'block';

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userRole = 'student'; // Default role

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userRole = userData.role || 'student'; // Get role, default to student
            currentUserSpan.textContent = userData.name || user.email; // Show name if available
        }

        // --- NEW REDIRECTION LOGIC HERE ---
        const currentPage = window.location.pathname.split('/').pop();

        if (userRole === 'admin') {
            adminLink.style.display = 'block';
            dashboardLink.style.display = 'none';
            // If admin is on login/signup page, redirect to admin.html
            if (currentPage === 'login.html' || currentPage === 'signup.html') {
                window.location.href = 'admin.html';
            }
        } else { // student role
            adminLink.style.display = 'none';
            dashboardLink.style.display = 'block';
            // If student is on login/signup page, redirect to dashboard.html
            if (currentPage === 'login.html' || currentPage === 'signup.html') {
                window.location.href = 'dashboard.html';
            }
        }
        // --- END NEW REDIRECTION LOGIC ---

    } else {
        currentUserSpan.textContent = 'Guest';
        authLinks.style.display = 'block';
        userLinks.style.display = 'none';
        dashboardLink.style.display = 'none';
        adminLink.style.display = 'none';

        // If not logged in, and trying to access protected pages, redirect to login
        const protectedPages = ['dashboard.html', 'admin.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            alert('You must be logged in to access this page.');
            window.location.href = 'login.html';
        }
    }
}

// Attach logout handler
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Redirect to home or login page after logout
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    });
}

// Listen for auth state changes
onAuthStateChanged(auth, updateAuthUI);

// --- Export useful functions for other modules if needed ---
export { auth, db, collection, getDocs, query, where, doc, getDoc, updateAuthUI };

// Add event listeners for dynamic content on specific pages if needed here
// Example: If on dashboard.html, call a function to load user batches
document.addEventListener('DOMContentLoaded', () => {
    // These specific page loads are handled within their respective JS files
    // (dashboard.js, admin.js) which already import from app.js
});

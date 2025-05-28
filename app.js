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

        // Check user's role (assuming you have a 'users' collection with a 'role' field)
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.role === 'admin') {
                adminLink.style.display = 'block';
                dashboardLink.style.display = 'none'; // Admin has different dashboard
            } else {
                adminLink.style.display = 'none';
                dashboardLink.style.display = 'block';
            }
        } else {
             // Default to student if no role defined
             adminLink.style.display = 'none';
             dashboardLink.style.display = 'block';
        }

    } else {
        currentUserSpan.textContent = 'Guest';
        authLinks.style.display = 'block';
        userLinks.style.display = 'none';
        dashboardLink.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Attach logout handler
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Redirec to home or login page after logout
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
    if (window.location.pathname.includes('dashboard.html')) {
        // We'll add content loading for dashboard here later
    }
    if (window.location.pathname.includes('admin.html')) {
        // We'll add admin specific checks and content loading here later
    }
});


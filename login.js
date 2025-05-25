import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

window.login = function () {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      messageEl.textContent = "Login successful! Redirecting...";
      messageEl.style.color = "green";

      setTimeout(() => {
        if (email.toLowerCase() === "admin@abp.com") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "student.html";
        }
      }, 1000);
    })
    .catch((error) => {
      messageEl.textContent = error.message;
      messageEl.style.color = "red";
    });
}
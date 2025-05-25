import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

window.login = function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageEl = document.getElementById('message');

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      messageEl.textContent = "Login successful!";
      messageEl.style.color = "green";
    })
    .catch((error) => {
      messageEl.textContent = error.message;
      messageEl.style.color = "red";
    });
}
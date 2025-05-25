import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.addEventListener("DOMContentLoaded", () => {
  const batchInfoDiv = document.getElementById('batch-info');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.email));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const batchId = data.batchId;
        if (!batchId) {
          batchInfoDiv.textContent = "No batch assigned to your account.";
          return;
        }
        const subjectsSnapshot = await getDocs(collection(db, `batches/${batchId}/subjects`));
        let html = `<h3>Batch: ${batchId}</h3><ul>`;
        subjectsSnapshot.forEach(doc => {
          const { name, title, url, type } = doc.data();
          html += `<li><strong>${name}</strong> - ${title} [<a href="${url}" target="_blank">${type}</a>]</li>`;
        });
        html += '</ul>';
        batchInfoDiv.innerHTML = html;
      } else {
        batchInfoDiv.textContent = "User record not found in database.";
      }
    } else {
      batchInfoDiv.textContent = "Please login first.";
    }
  });
});
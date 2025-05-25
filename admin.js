import { db } from './firebase-config.js';
import { collection, addDoc, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

window.createBatch = async function () {
  const name = document.getElementById('batch-name').value;
  await addDoc(collection(db, 'batches'), { name });
  alert('Batch created!');
};

window.addSubjectContent = async function () {
  const batchId = document.getElementById('batch-id-subject').value;
  const subject = document.getElementById('subject-name').value;
  const title = document.getElementById('content-title').value;
  const url = document.getElementById('content-url').value;
  const type = document.getElementById('content-type').value;

  const subjectRef = doc(collection(db, `batches/${batchId}/subjects`));
  await setDoc(subjectRef, { name: subject, title, url, type });
  alert('Content added!');
};

window.assignBatch = async function () {
  const email = document.getElementById('student-email').value;
  const batchId = document.getElementById('assign-batch-id').value;
  await setDoc(doc(db, 'users', email), { email, role: 'student', batchId });
  alert('Batch assigned!');
};
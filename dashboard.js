// dashboard.js
import { auth, onAuthStateChanged, db, collection, query, where, getDocs, doc, getDoc } from './firebase_init.js';

let currentStudentId = null;
let currentBatchId = null;
let currentSubjectId = null;
let currentChapterId = null; // To keep track of the selected chapter

// Elements
const studentNameSpan = document.getElementById('studentName');
const assignedBatchesContainer = document.getElementById('assignedBatchesContainer');
const noBatchesMessage = document.getElementById('noBatchesMessage');
const subjectsChaptersSection = document.getElementById('subjectsChaptersSection');
const currentBatchName = document.getElementById('currentBatchName');
const subjectsContainer = document.getElementById('subjectsContainer');
const chaptersListDiv = document.getElementById('chaptersList');
const chaptersContainer = document.getElementById('chaptersContainer');
const currentSubjectName = document.getElementById('currentSubjectName');
const contentViewerSection = document.getElementById('contentViewer');
const contentTitle = document.getElementById('contentTitle');
const videoContainer = document.getElementById('videoContainer');
const pdfContainer = document.getElementById('pdfContainer');
const backToBatchesBtn = document.getElementById('backToBatchesBtn');
const backToSubjectsBtn = document.getElementById('backToSubjectsBtn');
const backToChaptersBtn = document.getElementById('backToChaptersBtn');


// Function to display messages
function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Function to load assigned batches for the current user
async function loadAssignedBatches(userId) {
    assignedBatchesContainer.innerHTML = ''; // Clear previous batches
    noBatchesMessage.style.display = 'none';
    subjectsChaptersSection.style.display = 'none';
    contentViewerSection.style.display = 'none';

    try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            studentNameSpan.textContent = userData.name || userData.email;

            if (userData.assignedBatches && userData.assignedBatches.length > 0) {
                for (const batchId of userData.assignedBatches) {
                    const batchDocRef = doc(db, 'batches', batchId);
                    const batchDocSnap = await getDoc(batchDocRef);

                    if (batchDocSnap.exists()) {
                        const batchData = batchDocSnap.data();
                        const listItem = document.createElement('li');
                        listItem.className = 'list-group-item';
                        listItem.innerHTML = `
                            <strong>${batchData.name}</strong>
                            <button class="btn btn-primary btn-sm view-batch-btn" data-batch-id="${batchDocSnap.id}" data-batch-name="${batchData.name}">View Content</button>
                        `;
                        assignedBatchesContainer.appendChild(listItem);
                    }
                }
            } else {
                noBatchesMessage.style.display = 'block';
            }
        } else {
            console.warn('User document not found for ID:', userId);
            noBatchesMessage.textContent = 'Your user profile could not be loaded.';
            noBatchesMessage.className = 'alert alert-danger';
            noBatchesMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading assigned batches:', error);
        noBatchesMessage.textContent = 'Error loading batches: ' + error.message;
        noBatchesMessage.className = 'alert alert-danger';
        noBatchesMessage.style.display = 'block';
    }
}

// Function to load subjects for a given batch
async function loadSubjects(batchId, batchName) {
    subjectsContainer.innerHTML = ''; // Clear previous subjects
    chaptersListDiv.style.display = 'none'; // Hide chapters list when viewing subjects
    contentViewerSection.style.display = 'none'; // Hide content viewer
    subjectsChaptersSection.style.display = 'block'; // Show subject/chapter section
    currentBatchName.textContent = `Content for "${batchName}"`;
    currentBatchId = batchId; // Set current batch

    try {
        const q = query(collection(db, 'subjects'), where('batchId', '==', batchId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            subjectsContainer.innerHTML = '<p>No subjects found for this batch.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const subjectData = doc.data();
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.innerHTML = `
                    <strong>${subjectData.name}</strong>
                    <button class="btn btn-secondary btn-sm view-subject-btn" data-subject-id="${doc.id}" data-subject-name="${subjectData.name}">View Chapters</button>
                `;
                subjectsContainer.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
        subjectsContainer.innerHTML = `<p class="alert alert-danger">Error loading subjects: ${error.message}</p>`;
    }
}

// Function to load chapters for a given subject
async function loadChapters(subjectId, subjectName) {
    chaptersContainer.innerHTML = ''; // Clear previous chapters
    chaptersListDiv.style.display = 'block'; // Show chapters list
    contentViewerSection.style.display = 'none'; // Hide content viewer
    currentSubjectName.textContent = subjectName;
    currentSubjectId = subjectId; // Set current subject

    try {
        const q = query(collection(db, 'chapters'), where('subjectId', '==', subjectId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            chaptersContainer.innerHTML = '<p>No chapters found for this subject.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const chapterData = doc.data();
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.innerHTML = `
                    <strong>${chapterData.name}</strong>
                    <button class="btn btn-success btn-sm view-chapter-btn" data-chapter-id="${doc.id}" data-chapter-name="${chapterData.name}">View Content</button>
                `;
                chaptersContainer.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error('Error loading chapters:', error);
        chaptersContainer.innerHTML = `<p class="alert alert-danger">Error loading chapters: ${error.message}</p>`;
    }
}

// Function to load content for a given chapter
async function loadContent(chapterId, chapterName) {
    videoContainer.innerHTML = '';
    pdfContainer.innerHTML = '';
    videoContainer.style.display = 'none';
    pdfContainer.style.display = 'none';
    contentViewerSection.style.display = 'block';
    currentChapterId = chapterId; // Set current chapter
    contentTitle.textContent = `Content for "${chapterName}"`;

    try {
        const q = query(collection(db, 'contents'), where('chapterId', '==', chapterId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            contentViewerSection.innerHTML = `<p class="alert alert-info">No content found for this chapter.</p>
                <button class="btn btn-secondary" id="backToChaptersBtn" style="margin-top: 20px;">Back to Chapters</button>`;
                // Re-add event listener if button is re-created
                document.getElementById('backToChaptersBtn').addEventListener('click', () => {
                    loadChapters(currentSubjectId, currentSubjectName.textContent);
                });
        } else {
            querySnapshot.forEach((doc) => {
                const contentData = doc.data();
                if (contentData.type === 'video' && contentData.url) {
                    videoContainer.innerHTML = `<iframe src="${contentData.url}" frameborder="0" allowfullscreen></iframe>`;
                    videoContainer.style.display = 'block';
                } else if (contentData.type === 'pdf' && contentData.url) {
                    pdfContainer.innerHTML = `<iframe src="${contentData.url}" frameborder="0"></iframe>`;
                    pdfContainer.style.display = 'block';
                }
                // If there are multiple contents, only the last one will show fully in this simple viewer.
                // For multiple contents, you'd list them and allow selection.
                // For now, we'll just show the last one found.
            });
        }
    } catch (error) {
        console.error('Error loading content:', error);
        contentViewerSection.innerHTML = `<p class="alert alert-danger">Error loading content: ${error.message}</p>
        <button class="btn btn-secondary" id="backToChaptersBtn" style="margin-top: 20px;">Back to Chapters</button>`;
        document.getElementById('backToChaptersBtn').addEventListener('click', () => {
            loadChapters(currentSubjectId, currentSubjectName.textContent);
        });
    }
}


// Event listeners for navigating content
document.addEventListener('click', (event) => {
    // View Batch button
    if (event.target.classList.contains('view-batch-btn')) {
        const batchId = event.target.dataset.batchId;
        const batchName = event.target.dataset.batchName;
        document.getElementById('batchesList').style.display = 'none'; // Hide batch list
        loadSubjects(batchId, batchName);
    }
    // View Subject button
    if (event.target.classList.contains('view-subject-btn')) {
        const subjectId = event.target.dataset.subjectId;
        const subjectName = event.target.dataset.subjectName;
        document.getElementById('subjectsList').style.display = 'none'; // Hide subjects list
        loadChapters(subjectId, subjectName);
    }
    // View Chapter button
    if (event.target.classList.contains('view-chapter-btn')) {
        const chapterId = event.target.dataset.chapterId;
        const chapterName = event.target.dataset.chapterName;
        chaptersListDiv.style.display = 'none'; // Hide chapters list
        loadContent(chapterId, chapterName);
    }
});

// Back buttons
if (backToBatchesBtn) {
    backToBatchesBtn.addEventListener('click', () => {
        document.getElementById('batchesList').style.display = 'block'; // Show batch list
        subjectsChaptersSection.style.display = 'none'; // Hide subject/chapter section
        contentViewerSection.style.display = 'none'; // Hide content viewer
        // Optionally reload batches if dynamic updates are expected
        // loadAssignedBatches(currentStudentId);
    });
}

if (backToSubjectsBtn) {
    backToSubjectsBtn.addEventListener('click', () => {
        document.getElementById('subjectsList').style.display = 'block'; // Show subjects list
        chaptersListDiv.style.display = 'none'; // Hide chapters list
        contentViewerSection.style.display = 'none'; // Hide content viewer
        // Optionally reload subjects if dynamic updates are expected
        // loadSubjects(currentBatchId, currentBatchName.textContent.replace('Content for "', '').replace('"', ''));
    });
}

if (backToChaptersBtn) {
    backToChaptersBtn.addEventListener('click', () => {
        chaptersListDiv.style.display = 'block'; // Show chapters list
        contentViewerSection.style.display = 'none'; // Hide content viewer
        // Optionally reload chapters if dynamic updates are expected
        // loadChapters(currentSubjectId, currentSubjectName.textContent);
    });
}


// Authenticated user check for dashboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentStudentId = user.uid;
        loadAssignedBatches(user.uid);
    } else {
        // If not logged in, redirect to login page
        window.location.href = 'login.html';
    }
});

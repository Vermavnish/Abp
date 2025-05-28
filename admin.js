// admin.js
import { auth, onAuthStateChanged, db, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc, storage, ref, uploadBytes, getDownloadURL } from './firebase_init.js';

// --- Global Elements ---
const adminMessageDiv = document.getElementById('adminMessage');

// Add Batch elements
const addBatchForm = document.getElementById('addBatchForm');
const batchNameInput = document.getElementById('batchName');
const batchDescriptionInput = document.getElementById('batchDescription');
const existingBatchesList = document.getElementById('existingBatchesList');

// Add Subject elements
const addSubjectForm = document.getElementById('addSubjectForm');
const subjectBatchSelect = document.getElementById('subjectBatchSelect');
const subjectNameInput = document.getElementById('subjectName');
const viewSubjectsByBatchSelect = document.getElementById('viewSubjectsByBatch');
const existingSubjectsList = document.getElementById('existingSubjectsList');

// Add Chapter elements
const addChapterForm = document.getElementById('addChapterForm');
const chapterBatchSelect = document.getElementById('chapterBatchSelect');
const chapterSubjectSelect = document.getElementById('chapterSubjectSelect');
const chapterNameInput = document.getElementById('chapterName');
const viewChaptersBySubjectSelect = document.getElementById('viewChaptersBySubject');
const existingChaptersList = document.getElementById('existingChaptersList');

// Upload Content elements
const uploadContentForm = document.getElementById('uploadContentForm');
const contentBatchSelect = document.getElementById('contentBatchSelect');
const contentSubjectSelect = document.getElementById('contentSubjectSelect');
const contentChapterSelect = document.getElementById('contentChapterSelect');
const contentTypeSelect = document.getElementById('contentType');
const contentTitleInput = document.getElementById('contentTitle');
const contentUrlGroup = document.getElementById('contentUrlGroup');
const contentUrlInput = document.getElementById('contentUrl');
const contentFileGroup = document.getElementById('contentFileGroup');
const contentFileInput = document.getElementById('contentFile');
const viewContentsByChapterSelect = document.getElementById('viewContentsByChapter');
const existingContentsList = document.getElementById('existingContentsList');


// Assign Batch elements
const assignStudentEmailInput = document.getElementById('assignStudentEmail');
const findStudentBtn = document.getElementById('findStudentBtn');
const foundStudentInfoDiv = document.getElementById('foundStudentInfo');
const foundStudentNameSpan = document.getElementById('foundStudentName');
const foundStudentEmailSpan = document.getElementById('foundStudentEmail');
const currentAssignedBatchesSpan = document.getElementById('currentAssignedBatches');
const batchToAssignSelect = document.getElementById('batchToAssignSelect');
const assignBatchBtn = document.getElementById('assignBatchBtn');
const removeBatchBtn = document.getElementById('removeBatchBtn');
const studentNotFoundMessageDiv = document.getElementById('studentNotFoundMessage');

let allBatches = [];
let allSubjects = [];
let allChapters = [];
let foundStudentData = null; // Store the student data for batch assignment

// --- Helper Functions ---
function displayAdminMessage(message, type = 'success') {
    adminMessageDiv.textContent = message;
    adminMessageDiv.className = `alert alert-${type}`;
    adminMessageDiv.style.display = 'block';
    setTimeout(() => {
        adminMessageDiv.style.display = 'none';
    }, 5000);
}

async function loadAllBatches() {
    allBatches = []; // Clear array
    const querySnapshot = await getDocs(collection(db, 'batches'));
    querySnapshot.forEach((doc) => {
        allBatches.push({ id: doc.id, ...doc.data() });
    });
    renderBatches();
    populateBatchSelects();
}

function renderBatches() {
    existingBatchesList.innerHTML = '';
    if (allBatches.length === 0) {
        existingBatchesList.innerHTML = '<p>No batches added yet.</p>';
        return;
    }
    allBatches.forEach(batch => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <strong>${batch.name}</strong> (${batch.description || 'No description'})
            <button class="btn btn-danger btn-sm" data-id="${batch.id}" data-type="batch">Delete</button>
        `;
        existingBatchesList.appendChild(li);
    });
}

function populateBatchSelects() {
    const selects = [subjectBatchSelect, chapterBatchSelect, contentBatchSelect, batchToAssignSelect, viewSubjectsByBatchSelect];
    selects.forEach(select => {
        const currentValue = select.value; // Preserve current selection if any
        select.innerHTML = '<option value="">-- Select a Batch --</option>';
        allBatches.forEach(batch => {
            const option = document.createElement('option');
            option.value = batch.id;
            option.textContent = batch.name;
            select.appendChild(option);
        });
        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue; // Restore selection
        }
    });
}

async function loadAllSubjects() {
    allSubjects = [];
    const querySnapshot = await getDocs(collection(db, 'subjects'));
    querySnapshot.forEach((doc) => {
        allSubjects.push({ id: doc.id, ...doc.data() });
    });
    // Render subjects only when a batch is selected for viewing
    renderSubjects(viewSubjectsByBatchSelect.value);
    populateSubjectSelects();
}

function renderSubjects(batchId) {
    existingSubjectsList.innerHTML = '';
    const filteredSubjects = batchId ? allSubjects.filter(sub => sub.batchId === batchId) : [];

    if (filteredSubjects.length === 0) {
        existingSubjectsList.innerHTML = '<p>No subjects found for this batch or no batch selected.</p>';
        return;
    }
    filteredSubjects.forEach(subject => {
        const batchName = allBatches.find(b => b.id === subject.batchId)?.name || 'N/A';
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <strong>${subject.name}</strong> (Batch: ${batchName})
            <button class="btn btn-danger btn-sm" data-id="${subject.id}" data-type="subject">Delete</button>
        `;
        existingSubjectsList.appendChild(li);
    });
}

function populateSubjectSelects(selectedBatchId = null) {
    const selects = [chapterSubjectSelect, contentSubjectSelect, viewChaptersBySubjectSelect];
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- Select a Subject --</option>';
        select.disabled = true; // Disable until a batch is selected

        if (selectedBatchId) {
            const subjectsInBatch = allSubjects.filter(sub => sub.batchId === selectedBatchId);
            subjectsInBatch.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                select.appendChild(option);
            });
            select.disabled = false;
        }

        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
        }
    });
}

async function loadAllChapters() {
    allChapters = [];
    const querySnapshot = await getDocs(collection(db, 'chapters'));
    querySnapshot.forEach((doc) => {
        allChapters.push({ id: doc.id, ...doc.data() });
    });
    // Render chapters only when a subject is selected for viewing
    renderChapters(viewChaptersBySubjectSelect.value);
    populateChapterSelects();
}

function renderChapters(subjectId) {
    existingChaptersList.innerHTML = '';
    const filteredChapters = subjectId ? allChapters.filter(chap => chap.subjectId === subjectId) : [];

    if (filteredChapters.length === 0) {
        existingChaptersList.innerHTML = '<p>No chapters found for this subject or no subject selected.</p>';
        return;
    }
    filteredChapters.forEach(chapter => {
        const subjectName = allSubjects.find(s => s.id === chapter.subjectId)?.name || 'N/A';
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <strong>${chapter.name}</strong> (Subject: ${subjectName})
            <button class="btn btn-danger btn-sm" data-id="${chapter.id}" data-type="chapter">Delete</button>
        `;
        existingChaptersList.appendChild(li);
    });
}

function populateChapterSelects(selectedSubjectId = null) {
    const selects = [contentChapterSelect, viewContentsByChapterSelect];
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- Select a Chapter --</option>';
        select.disabled = true; // Disable until a subject is selected

        if (selectedSubjectId) {
            const chaptersInSubject = allChapters.filter(chap => chap.subjectId === selectedSubjectId);
            chaptersInSubject.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter.id;
                option.textContent = chapter.name;
                select.appendChild(option);
            });
            select.disabled = false;
        }

        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
        }
    });
}

async function loadExistingContents(chapterId) {
    existingContentsList.innerHTML = '';
    if (!chapterId) {
        existingContentsList.innerHTML = '<p>Select a chapter to view content.</p>';
        return;
    }
    try {
        const q = query(collection(db, 'contents'), where('chapterId', '==', chapterId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            existingContentsList.innerHTML = '<p>No content found for this chapter.</p>';
        } else {
            querySnapshot.forEach((docSnap) => {
                const contentData = docSnap.data();
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `
                    <strong>${contentData.title}</strong> (${contentData.type.toUpperCase()})
                    <a href="${contentData.url}" target="_blank" class="btn btn-secondary btn-sm" style="margin-left: 10px;">View</a>
                    <button class="btn btn-danger btn-sm" data-id="${docSnap.id}" data-type="content" data-url="${contentData.url}" data-content-type="${contentData.type}" style="margin-left: 10px;">Delete</button>
                `;
                existingContentsList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error loading contents:', error);
        existingContentsList.innerHTML = `<p class="alert alert-danger">Error loading contents: ${error.message}</p>`;
    }
}


// --- Event Listeners and Form Submissions ---

// Admin role check on page load
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            // User is admin, load data
            loadAllBatches();
            loadAllSubjects(); // This will also populate subject selects on load
            loadAllChapters(); // This will also populate chapter selects on load
            // The content list will be loaded when a chapter is selected
        } else {
            // Not an admin, redirect
            alert('Access Denied: You must be an administrator to view this page.');
            window.location.href = 'index.html';
        }
    } else {
        // Not logged in, redirect
        alert('Please log in to access the admin panel.');
        window.location.href = 'login.html';
    }
});

// Add Batch Form
if (addBatchForm) {
    addBatchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = batchNameInput.value.trim();
        const description = batchDescriptionInput.value.trim();

        if (!name) {
            displayAdminMessage('Batch Name is required.', 'danger');
            return;
        }

        try {
            await addDoc(collection(db, 'batches'), {
                name: name,
                description: description
            });
            displayAdminMessage('Batch added successfully!');
            batchNameInput.value = '';
            batchDescriptionInput.value = '';
            loadAllBatches(); // Reload batches to update lists
        } catch (error) {
            console.error('Error adding batch:', error);
            displayAdminMessage('Error adding batch: ' + error.message, 'danger');
        }
    });
}

// Add Subject Form
if (addSubjectForm) {
    addSubjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const batchId = subjectBatchSelect.value;
        const name = subjectNameInput.value.trim();

        if (!batchId || !name) {
            displayAdminMessage('Both Batch and Subject Name are required.', 'danger');
            return;
        }

        try {
            await addDoc(collection(db, 'subjects'), {
                name: name,
                batchId: batchId
            });
            displayAdminMessage('Subject added successfully!');
            subjectNameInput.value = '';
            subjectBatchSelect.value = ''; // Reset select
            loadAllSubjects(); // Reload subjects
        } catch (error) {
            console.error('Error adding subject:', error);
            displayAdminMessage('Error adding subject: ' + error.message, 'danger');
        }
    });
}

// Handle subject selection change for viewing subjects
if (viewSubjectsByBatchSelect) {
    viewSubjectsByBatchSelect.addEventListener('change', (e) => {
        renderSubjects(e.target.value);
    });
}

// Add Chapter Form
if (addChapterForm) {
    addChapterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subjectId = chapterSubjectSelect.value;
        const name = chapterNameInput.value.trim();

        if (!subjectId || !name) {
            displayAdminMessage('Both Subject and Chapter Name are required.', 'danger');
            return;
        }

        try {
            await addDoc(collection(db, 'chapters'), {
                name: name,
                subjectId: subjectId
            });
            displayAdminMessage('Chapter added successfully!');
            chapterNameInput.value = '';
            chapterBatchSelect.value = ''; // Reset parent selects too
            chapterSubjectSelect.value = '';
            chapterSubjectSelect.disabled = true;
            loadAllChapters(); // Reload chapters
        } catch (error) {
            console.error('Error adding chapter:', error);
            displayAdminMessage('Error adding chapter: ' + error.message, 'danger');
        }
    });
}

// Populate Subject Select based on Batch Selection (for Add Chapter & Upload Content)
if (chapterBatchSelect) {
    chapterBatchSelect.addEventListener('change', (e) => {
        populateSubjectSelects(e.target.value);
    });
}
if (contentBatchSelect) {
    contentBatchSelect.addEventListener('change', (e) => {
        populateSubjectSelects(e.target.value);
    });
}

// Populate Chapter Select based on Subject Selection (for Add Content)
if (contentSubjectSelect) {
    contentSubjectSelect.addEventListener('change', (e) => {
        populateChapterSelects(e.target.value);
    });
}

// Handle chapter selection change for viewing chapters
if (viewChaptersBySubjectSelect) {
    viewChaptersBySubjectSelect.addEventListener('change', (e) => {
        renderChapters(e.target.value);
    });
}


// Upload Content Form
if (uploadContentForm) {
    // Toggle URL/File input based on content type
    contentTypeSelect.addEventListener('change', () => {
        if (contentTypeSelect.value === 'pdf-upload') { // If you enable direct PDF uploads
            contentUrlGroup.style.display = 'none';
            contentFileGroup.style.display = 'block';
            contentUrlInput.removeAttribute('required');
            contentFileInput.setAttribute('required', 'true');
        } else if (contentTypeSelect.value === 'video' || contentTypeSelect.value === 'pdf') {
            contentUrlGroup.style.display = 'block';
            contentFileGroup.style.display = 'none';
            contentUrlInput.setAttribute('required', 'true');
            contentFileInput.removeAttribute('required');
        } else {
            contentUrlGroup.style.display = 'none';
            contentFileGroup.style.display = 'none';
            contentUrlInput.removeAttribute('required');
            contentFileInput.removeAttribute('required');
        }
    });

    uploadContentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const chapterId = contentChapterSelect.value;
        const type = contentTypeSelect.value;
        const title = contentTitleInput.value.trim();
        let url = contentUrlInput.value.trim();
        const file = contentFileInput.files[0];

        if (!chapterId || !type || !title) {
            displayAdminMessage('Chapter, Type, and Title are required.', 'danger');
            return;
        }

        try {
            if (type === 'pdf-upload' && file) {
                // Upload PDF to Firebase Storage
                const storageRef = ref(storage, `content_pdfs/${chapterId}/${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                url = await getDownloadURL(snapshot.ref);
                displayAdminMessage('File uploaded to Storage!');
            } else if ((type === 'video' || type === 'pdf') && !url) {
                displayAdminMessage('Content URL is required for this type.', 'danger');
                return;
            }

            if (!url) {
                 displayAdminMessage('Content URL/File is missing.', 'danger');
                 return;
            }

            await addDoc(collection(db, 'contents'), {
                chapterId: chapterId,
                type: type === 'pdf-upload' ? 'pdf' : type, // Store as 'pdf' even if uploaded
                url: url,
                title: title,
                uploadedAt: new Date()
            });
            displayAdminMessage('Content uploaded successfully!');
            uploadContentForm.reset();
            contentChapterSelect.disabled = true;
            contentSubjectSelect.disabled = true;
            contentUrlGroup.style.display = 'none';
            contentFileGroup.style.display = 'none';
            loadExistingContents(chapterId); // Reload content for the selected chapter
        } catch (error) {
            console.error('Error uploading content:', error);
            displayAdminMessage('Error uploading content: ' + error.message, 'danger');
        }
    });
}

// Handle chapter selection change for viewing contents
if (viewContentsByChapterSelect) {
    viewContentsByChapterSelect.addEventListener('change', (e) => {
        loadExistingContents(e.target.value);
    });
}


// Delete functionality (for batches, subjects, chapters, contents)
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-danger') && e.target.dataset.id) {
        const idToDelete = e.target.dataset.id;
        const typeToDelete = e.target.dataset.type;
        const confirmDelete = confirm(`Are you sure you want to delete this ${typeToDelete}? This action cannot be undone.`);

        if (!confirmDelete) return;

        try {
            if (typeToDelete === 'batch') {
                await deleteDoc(doc(db, 'batches', idToDelete));
                // TODO: Implement cascading delete for subjects, chapters, contents, and user assignments
                // For simplicity now, we just delete the batch.
                // In a real app, you'd use Firebase Functions for cascading deletes to prevent orphan data.
                displayAdminMessage('Batch deleted successfully (Note: Related data not automatically deleted).');
                loadAllBatches();
                loadAllSubjects(); // Refresh related lists
                loadAllChapters();
            } else if (typeToDelete === 'subject') {
                await deleteDoc(doc(db, 'subjects', idToDelete));
                // TODO: Cascading delete for chapters and contents
                displayAdminMessage('Subject deleted successfully (Note: Related data not automatically deleted).');
                loadAllSubjects();
                loadAllChapters(); // Refresh related lists
            } else if (typeToDelete === 'chapter') {
                await deleteDoc(doc(db, 'chapters', idToDelete));
                // TODO: Cascading delete for contents
                displayAdminMessage('Chapter deleted successfully (Note: Related data not automatically deleted).');
                loadAllChapters();
            } else if (typeToDelete === 'content') {
                await deleteDoc(doc(db, 'contents', idToDelete));
                const contentType = e.target.dataset.contentType;
                const contentUrl = e.target.dataset.url;
                // If it was a PDF uploaded to storage, delete the file too
                if (contentType === 'pdf' && contentUrl.includes('firebasestorage.googleapis.com')) {
                    const fileRef = ref(storage, contentUrl);
                    await deleteObject(fileRef).catch(error => {
                        console.warn('Could not delete file from storage (might not exist or permissions issue):', error);
                    });
                }
                displayAdminMessage('Content deleted successfully!');
                loadExistingContents(viewContentsByChapterSelect.value); // Reload current chapter's content
            }
        } catch (error) {
            console.error(`Error deleting ${typeToDelete}:`, error);
            displayAdminMessage(`Error deleting ${typeToDelete}: ` + error.message, 'danger');
        }
    }
});


// Assign Batch to Student
if (findStudentBtn) {
    findStudentBtn.addEventListener('click', async () => {
        const email = assignStudentEmailInput.value.trim();
        foundStudentInfoDiv.style.display = 'none';
        studentNotFoundMessageDiv.style.display = 'none';
        foundStudentData = null; // Clear previous student data

        if (!email) {
            displayAdminMessage('Please enter a student email.', 'danger');
            return;
        }

        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                foundStudentData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                foundStudentNameSpan.textContent = foundStudentData.name || 'N/A';
                foundStudentEmailSpan.textContent = foundStudentData.email;

                const assignedBatchNames = foundStudentData.assignedBatches
                    .map(batchId => allBatches.find(b => b.id === batchId)?.name || 'Unknown Batch')
                    .join(', ');
                currentAssignedBatchesSpan.textContent = assignedBatchNames || 'None';

                foundStudentInfoDiv.style.display = 'block';
            } else {
                studentNotFoundMessageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error finding student:', error);
            displayAdminMessage('Error finding student: ' + error.message, 'danger');
        }
    });
}

if (assignBatchBtn) {
    assignBatchBtn.addEventListener('click', async () => {
        if (!foundStudentData) {
            displayAdminMessage('Please find a student first.', 'danger');
            return;
        }
        const batchId = batchToAssignSelect.value;
        if (!batchId) {
            displayAdminMessage('Please select a batch to assign.', 'danger');
            return;
        }

        try {
            const updatedBatches = new Set(foundStudentData.assignedBatches || []);
            if (!updatedBatches.has(batchId)) {
                updatedBatches.add(batchId);
                await updateDoc(doc(db, 'users', foundStudentData.id), {
                    assignedBatches: Array.from(updatedBatches)
                });
                displayAdminMessage(`Batch assigned successfully to ${foundStudentData.name || foundStudentData.email}!`);
                assignStudentEmailInput.value = foundStudentData.email; // Keep email for re-find
                findStudentBtn.click(); // Re-find to update UI
            } else {
                displayAdminMessage('Student is already assigned to this batch.', 'info');
            }
        } catch (error) {
            console.error('Error assigning batch:', error);
            displayAdminMessage('Error assigning batch: ' + error.message, 'danger');
        }
    });
}

if (removeBatchBtn) {
    removeBatchBtn.addEventListener('click', async () => {
        if (!foundStudentData) {
            displayAdminMessage('Please find a student first.', 'danger');
            return;
        }
        const batchId = batchToAssignSelect.value;
        if (!batchId) {
            displayAdminMessage('Please select a batch to remove.', 'danger');
            return;
        }

        try {
            let updatedBatches = new Set(foundStudentData.assignedBatches || []);
            if (updatedBatches.has(batchId)) {
                updatedBatches.delete(batchId);
                await updateDoc(doc(db, 'users', foundStudentData.id), {
                    assignedBatches: Array.from(updatedBatches)
                });
                displayAdminMessage(`Batch removed successfully from ${foundStudentData.name || foundStudentData.email}.`);
                assignStudentEmailInput.value = foundStudentData.email; // Keep email for re-find
                findStudentBtn.click(); // Re-find to update UI
            } else {
                displayAdminMessage('Student is not assigned to this batch.', 'info');
            }
        } catch (error) {
            console.error('Error removing batch:', error);
            displayAdminMessage('Error removing batch: ' + error.message, 'danger');
        }
    });
}

// Initial calls to populate selects on admin page load (if admin)
// These are handled by the onAuthStateChanged for admin role check.


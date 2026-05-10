// Data Storage
let students = JSON.parse(localStorage.getItem('students')) || [
    { id: '1', name: 'Sudharsan Pandiaraja', roll: 'SP001' },
    { id: '2', name: 'John Doe', roll: 'JD002' },
    { id: '3', name: 'Alice Smith', roll: 'AS003' }
];

let exams = JSON.parse(localStorage.getItem('exams')) || [];
let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || {};

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// --- Initialization ---
function init() {
    renderStudents();
    renderExams();
    updateDashboard();
    setupEventListeners();
    populateReportDropdown();
}

// --- Navigation ---
function setupEventListeners() {
    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Student Management
    document.getElementById('add-student-btn').addEventListener('click', () => {
        document.getElementById('add-student-form').classList.remove('hidden');
    });
    document.getElementById('cancel-student-btn').addEventListener('click', () => {
        document.getElementById('add-student-form').classList.add('hidden');
    });
    document.getElementById('save-student-btn').addEventListener('click', addStudent);

    // Exam Management
    document.getElementById('add-exam-btn').addEventListener('click', () => {
        document.getElementById('add-exam-form').classList.remove('hidden');
    });
    document.getElementById('cancel-exam-btn').addEventListener('click', () => {
        document.getElementById('add-exam-form').classList.add('hidden');
    });
    document.getElementById('save-exam-btn').addEventListener('click', addExam);

    // Attendance Modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('save-attendance-btn').addEventListener('click', saveAttendance);

    // Report
    document.getElementById('report-exam-select').addEventListener('change', generateReport);
}

// --- Student Logic ---
function renderStudents() {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    students.forEach(student => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><b>${student.name}</b> <small>(${student.roll})</small></span>
            <button class="secondary-btn" onclick="deleteStudent('${student.id}')" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">Remove</button>
        `;
        list.appendChild(li);
    });
    updateDashboard();
}

function addStudent() {
    const nameInput = document.getElementById('new-student-name');
    const rollInput = document.getElementById('new-student-roll');

    if (nameInput.value && rollInput.value) {
        students.push({
            id: Date.now().toString(),
            name: nameInput.value,
            roll: rollInput.value
        });
        saveData();
        renderStudents();
        nameInput.value = '';
        rollInput.value = '';
        document.getElementById('add-student-form').classList.add('hidden');
    }
}

window.deleteStudent = function (id) {
    if (confirm('Delete this student?')) {
        students = students.filter(s => s.id !== id);
        saveData();
        renderStudents();
    }
};

// --- Exam Logic ---
function renderExams() {
    const list = document.getElementById('exam-list');
    list.innerHTML = '';
    exams.forEach(exam => {
        const div = document.createElement('div');
        div.className = 'exam-card';
        div.innerHTML = `
            <h3>${exam.name}</h3>
            <small>${new Date(exam.date).toLocaleDateString()}</small>
            <button class="primary-btn" onclick="openAttendanceModal('${exam.id}')">Mark Attendance</button>
        `;
        list.appendChild(div);
    });
    updateDashboard();
    populateReportDropdown();
}

function addExam() {
    const nameInput = document.getElementById('new-exam-name');
    const dateInput = document.getElementById('new-exam-date');

    if (nameInput.value && dateInput.value) {
        exams.push({
            id: Date.now().toString(),
            name: nameInput.value,
            date: dateInput.value
        });
        saveData();
        renderExams();
        nameInput.value = '';
        dateInput.value = '';
        document.getElementById('add-exam-form').classList.add('hidden');
    }
}

// --- Attendance Logic ---
let currentExamId = null;

window.openAttendanceModal = function (examId) {
    currentExamId = examId;
    const exam = exams.find(e => e.id === examId);
    document.getElementById('modal-exam-title').innerText = `Attendance: ${exam.name}`;

    const list = document.getElementById('attendance-student-list');
    list.innerHTML = '';

    // Get existing record or default to empty
    const record = attendanceRecords[examId] || {};

    students.forEach(student => {
        const isPresent = record[student.id] !== false; // Default to true if not set, or check logic
        // Let's default to unchecked (Absent) if new, or check if present? 
        // Usually safer to default absent or have a specific state. 
        // Let's assume record[id] === true means present. 

        const isChecked = record[student.id] === true;

        const div = document.createElement('div');
        div.className = 'attendance-item';
        div.innerHTML = `
            <label for="att-${student.id}">${student.name} (${student.roll})</label>
            <input type="checkbox" id="att-${student.id}" ${isChecked ? 'checked' : ''}>
        `;
        list.appendChild(div);
    });

    document.getElementById('attendance-modal').classList.remove('hidden');
};

function closeModal() {
    document.getElementById('attendance-modal').classList.add('hidden');
    currentExamId = null;
}

function saveAttendance() {
    if (!currentExamId) return;

    const newRecord = {};
    students.forEach(student => {
        const checkbox = document.getElementById(`att-${student.id}`);
        newRecord[student.id] = checkbox.checked;
    });

    attendanceRecords[currentExamId] = newRecord;
    saveData();
    closeModal();

    // If we are currently viewing report for this exam, refresh it
    const reportSelect = document.getElementById('report-exam-select');
    if (reportSelect.value === currentExamId) {
        generateReport();
    }
}

// --- Reports Logic ---
function populateReportDropdown() {
    const select = document.getElementById('report-exam-select');
    select.innerHTML = '<option value="">Select an Exam to view Report</option>';
    exams.forEach(exam => {
        const option = document.createElement('option');
        option.value = exam.id;
        option.innerText = exam.name;
        select.appendChild(option);
    });
}

function generateReport() {
    const examId = document.getElementById('report-exam-select').value;
    const container = document.getElementById('report-results');

    if (!examId) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const record = attendanceRecords[examId] || {};
    let presentCount = 0;
    let absentCount = 0;

    const presentList = document.getElementById('present-list');
    const absentList = document.getElementById('absent-list');
    presentList.innerHTML = '';
    absentList.innerHTML = '';

    students.forEach(student => {
        if (record[student.id]) {
            presentCount++;
            const li = document.createElement('li');
            li.textContent = student.name;
            presentList.appendChild(li);
        } else {
            absentCount++;
            const li = document.createElement('li');
            li.textContent = student.name;
            absentList.appendChild(li);
        }
    });

    document.getElementById('report-present-count').textContent = presentCount;
    document.getElementById('report-absent-count').textContent = absentCount;
}

// --- Dashboard & Storage ---
function updateDashboard() {
    document.getElementById('total-students-count').innerText = students.length;
    document.getElementById('total-exams-count').innerText = exams.length;
}

function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('exams', JSON.stringify(exams));
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
}

// Start
init();

/**
 * Demo Service
 * Provides offline mock data using localStorage
 * Works without Firebase configuration
 */

const DEMO_USERS_KEY = 'sms_demo_users';
const DEMO_STUDENTS_KEY = 'sms_demo_students';
const DEMO_ATTENDANCE_KEY = 'sms_demo_attendance';
const DEMO_LEAVES_KEY = 'sms_demo_leaves';
const DEMO_ANNOUNCEMENTS_KEY = 'sms_demo_announcements';
const DEMO_SESSION_KEY = 'sms_demo_session';

/**
 * Seed initial demo data
 */
export function seedDemoData() {
  // Seed users if not exists
  if (!localStorage.getItem(DEMO_USERS_KEY)) {
    const users = {
      admin: {
        uid: 'admin',
        displayName: 'Admin User',
        email: 'admin@school.com',
        role: 'admin',
        password: 'admin123',
      },
      teacher: {
        uid: 'teacher',
        displayName: 'Teacher Sarah',
        email: 'teacher@school.com',
        role: 'teacher',
        password: 'teacher123',
      },
      student: {
        uid: 'student',
        displayName: 'Student John',
        email: 'student@school.com',
        role: 'student',
        password: 'student123',
      },
    };
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  }

  // Seed students if not exists
  if (!localStorage.getItem(DEMO_STUDENTS_KEY)) {
    const students = [
      {
        id: 's1', name: 'Aarav Sharma', studentId: 'STU001', class: '10', section: 'A',
        rollNumber: '1', phone: '9876543210', email: 'aarav@example.com', address: '123 Main St',
        fatherName: 'Rajesh Sharma', fatherContact: '9876543211',
        motherName: 'Priya Sharma', motherContact: '9876543212',
        guardianContact: '9876543213', photoURL: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's2', name: 'Ananya Patel', studentId: 'STU002', class: '10', section: 'A',
        rollNumber: '2', phone: '9876543214', email: 'ananya@example.com', address: '456 Oak Ave',
        fatherName: 'Vikram Patel', fatherContact: '9876543215',
        motherName: 'Neha Patel', motherContact: '9876543216',
        guardianContact: '9876543217', photoURL: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's3', name: 'Rohan Gupta', studentId: 'STU003', class: '9', section: 'B',
        rollNumber: '5', phone: '9876543218', email: 'rohan@example.com', address: '789 Pine Rd',
        fatherName: 'Amit Gupta', fatherContact: '9876543219',
        motherName: 'Sunita Gupta', motherContact: '9876543220',
        guardianContact: '9876543221', photoURL: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's4', name: 'Ishita Verma', studentId: 'STU004', class: '10', section: 'A',
        rollNumber: '3', phone: '9876543222', email: 'ishita@example.com', address: '321 Elm St',
        fatherName: 'Sanjay Verma', fatherContact: '9876543223',
        motherName: 'Kavita Verma', motherContact: '9876543224',
        guardianContact: '9876543225', photoURL: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's5', name: 'Arjun Singh', studentId: 'STU005', class: '9', section: 'B',
        rollNumber: '6', phone: '9876543226', email: 'arjun@example.com', address: '654 Maple Dr',
        fatherName: 'Dinesh Singh', fatherContact: '9876543227',
        motherName: 'Meera Singh', motherContact: '9876543228',
        guardianContact: '9876543229', photoURL: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: 's6', name: 'Divya Kaur', studentId: 'STU006', class: '8', section: 'C',
        rollNumber: '10', phone: '9876543230', email: 'divya@example.com', address: '987 Birch Ln',
        fatherName: 'Gurpreet Kaur', fatherContact: '9876543231',
        motherName: 'Amandeep Kaur', motherContact: '9876543232',
        guardianContact: '9876543233', photoURL: '',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(DEMO_STUDENTS_KEY, JSON.stringify(students));
  }

  // Seed announcements if not exists
  if (!localStorage.getItem(DEMO_ANNOUNCEMENTS_KEY)) {
    const announcements = [
      {
        id: 'a1',
        title: 'Welcome to the New Academic Year',
        description: 'We are excited to welcome all students and parents to the new academic year. Classes will begin from Monday. Please check your class schedules on the portal.',
        date: new Date().toISOString().split('T')[0],
        createdBy: 'Admin User',
      },
      {
        id: 'a2',
        title: 'Parent-Teacher Meeting',
        description: 'The first parent-teacher meeting for this semester will be held on Saturday. All parents are requested to attend.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: 'Teacher Sarah',
      },
      {
        id: 'a3',
        title: 'Science Fair 2026',
        description: 'The annual Science Fair will be held next month. Students interested in participating should register with their class teacher by the end of this week.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: 'Admin User',
      },
    ];
    localStorage.setItem(DEMO_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }

  // Seed attendance (today's demo data)
  if (!localStorage.getItem(DEMO_ATTENDANCE_KEY)) {
    const today = new Date().toISOString().split('T')[0];
    const attendance = [
      { id: 'at1', studentId: 's1', studentName: 'Aarav Sharma', date: today, status: 'present' },
      { id: 'at2', studentId: 's2', studentName: 'Ananya Patel', date: today, status: 'present' },
      { id: 'at3', studentId: 's3', studentName: 'Rohan Gupta', date: today, status: 'absent' },
      { id: 'at4', studentId: 's4', studentName: 'Ishita Verma', date: today, status: 'present' },
      { id: 'at5', studentId: 's5', studentName: 'Arjun Singh', date: today, status: 'absent' },
      { id: 'at6', studentId: 's6', studentName: 'Divya Kaur', date: today, status: 'present' },
    ];
    localStorage.setItem(DEMO_ATTENDANCE_KEY, JSON.stringify(attendance));
  }

  // Seed leaves if not exists
  if (!localStorage.getItem(DEMO_LEAVES_KEY)) {
    const leaves = [
      {
        id: 'l1', studentName: 'Rohan Gupta', studentId: 's3',
        leaveType: 'sick', startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'Not feeling well, high fever',
        status: 'pending', appliedBy: 'Rohan Gupta',
      },
      {
        id: 'l2', studentName: 'Divya Kaur', studentId: 's6',
        leaveType: 'vacation', startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'Family trip planned',
        status: 'approved', appliedBy: 'Divya Kaur', approvedBy: 'Teacher Sarah',
      },
    ];
    localStorage.setItem(DEMO_LEAVES_KEY, JSON.stringify(leaves));
  }
}

// ==========================================
// AUTH DEMO FUNCTIONS
// ==========================================

export function demoLogin(email, password) {
  const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');
  const user = Object.values(users).find(u => u.email === email && u.password === password);
  if (user) {
    const session = { uid: user.uid, email: user.email, displayName: user.displayName, role: user.role };
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    return session;
  }
  return null;
}

export function demoLogout() {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function getDemoSession() {
  const data = localStorage.getItem(DEMO_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// ==========================================
// STUDENTS DEMO FUNCTIONS
// ==========================================

function getStudentsData() {
  return JSON.parse(localStorage.getItem(DEMO_STUDENTS_KEY) || '[]');
}

function saveStudentsData(students) {
  localStorage.setItem(DEMO_STUDENTS_KEY, JSON.stringify(students));
}

export function demoGetStudents() {
  return getStudentsData();
}

export function demoGetStudentById(id) {
  return getStudentsData().find(s => s.id === id) || null;
}

export function demoAddStudent(studentData) {
  const students = getStudentsData();
  const newStudent = {
    ...studentData,
    id: 's' + Date.now(),
    photoURL: studentData.photoURL || '',
    createdAt: new Date().toISOString(),
  };
  students.push(newStudent);
  saveStudentsData(students);
  return newStudent;
}

export function demoUpdateStudent(id, studentData) {
  const students = getStudentsData();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...studentData, updatedAt: new Date().toISOString() };
    saveStudentsData(students);
    return students[index];
  }
  return null;
}

export function demoDeleteStudent(id) {
  const students = getStudentsData().filter(s => s.id !== id);
  saveStudentsData(students);
  return id;
}

export function demoSearchStudents(term) {
  const students = getStudentsData();
  const t = term.toLowerCase();
  return students.filter(s =>
    s.name?.toLowerCase().includes(t) ||
    s.studentId?.toLowerCase().includes(t) ||
    s.rollNumber?.toString().includes(t) ||
    s.phone?.includes(t)
  );
}

export function demoGetStudentCount() {
  return getStudentsData().length;
}

// ==========================================
// ATTENDANCE DEMO FUNCTIONS
// ==========================================

function getAttendanceData() {
  return JSON.parse(localStorage.getItem(DEMO_ATTENDANCE_KEY) || '[]');
}

function saveAttendanceData(data) {
  localStorage.setItem(DEMO_ATTENDANCE_KEY, JSON.stringify(data));
}

export function demoMarkAttendance(studentId, date, status, studentName) {
  const records = getAttendanceData();
  const existing = records.findIndex(r => r.studentId === studentId && r.date === date);

  if (existing !== -1) {
    records[existing].status = status;
  } else {
    records.push({ id: 'at' + Date.now(), studentId, studentName, date, status });
  }
  saveAttendanceData(records);
  return { studentId, status };
}

export function demoGetAttendanceByDate(date, studentId = '') {
  const records = getAttendanceData();
  return records.filter(r => r.date === date && (!studentId || r.studentId === studentId));
}

export function demoGetStudentAttendanceHistory(studentId) {
  const records = getAttendanceData();
  return records.filter(r => r.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
}

export function demoGetAttendancePercentage(studentId) {
  const history = demoGetStudentAttendanceHistory(studentId);
  if (history.length === 0) return { percentage: 100, present: 0, total: 0 };
  const present = history.filter(a => a.status === 'present').length;
  return { percentage: Math.round((present / history.length) * 100), present, total: history.length };
}

export function demoGetTodayAttendance(todayDate) {
  const records = demoGetAttendanceByDate(todayDate);
  return {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    records,
  };
}

// ==========================================
// LEAVES DEMO FUNCTIONS
// ==========================================

function getLeavesData() {
  return JSON.parse(localStorage.getItem(DEMO_LEAVES_KEY) || '[]');
}

function saveLeavesData(data) {
  localStorage.setItem(DEMO_LEAVES_KEY, JSON.stringify(data));
}

export function demoApplyLeave(leaveData) {
  const leaves = getLeavesData();
  const newLeave = { ...leaveData, id: 'l' + Date.now(), status: 'pending', createdAt: new Date().toISOString() };
  leaves.unshift(newLeave);
  saveLeavesData(leaves);
  return newLeave;
}

export function demoApproveLeave(id, approvedBy) {
  const leaves = getLeavesData();
  const leave = leaves.find(l => l.id === id);
  if (leave) {
    leave.status = 'approved';
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date().toISOString();
    saveLeavesData(leaves);
  }
  return { id, status: 'approved' };
}

export function demoRejectLeave(id, rejectionReason) {
  const leaves = getLeavesData();
  const leave = leaves.find(l => l.id === id);
  if (leave) {
    leave.status = 'rejected';
    leave.rejectionReason = rejectionReason;
    leave.rejectedAt = new Date().toISOString();
    saveLeavesData(leaves);
  }
  return { id, status: 'rejected' };
}

export function demoGetLeaves(statusFilter = '') {
  let leaves = getLeavesData();
  if (statusFilter) leaves = leaves.filter(l => l.status === statusFilter);
  return leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function demoGetPendingLeavesCount() {
  return getLeavesData().filter(l => l.status === 'pending').length;
}

// ==========================================
// ANNOUNCEMENTS DEMO FUNCTIONS
// ==========================================

function getAnnouncementsData() {
  return JSON.parse(localStorage.getItem(DEMO_ANNOUNCEMENTS_KEY) || '[]');
}

function saveAnnouncementsData(data) {
  localStorage.setItem(DEMO_ANNOUNCEMENTS_KEY, JSON.stringify(data));
}

export function demoCreateAnnouncement(data) {
  const announcements = getAnnouncementsData();
  const newAnnouncement = { ...data, id: 'a' + Date.now(), createdAt: new Date().toISOString() };
  announcements.unshift(newAnnouncement);
  saveAnnouncementsData(announcements);
  return newAnnouncement;
}

export function demoGetAnnouncements() {
  return getAnnouncementsData().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function demoUpdateAnnouncement(id, data) {
  const announcements = getAnnouncementsData();
  const index = announcements.findIndex(a => a.id === id);
  if (index !== -1) {
    announcements[index] = { ...announcements[index], ...data, updatedAt: new Date().toISOString() };
    saveAnnouncementsData(announcements);
    return announcements[index];
  }
  return null;
}

export function demoDeleteAnnouncement(id) {
  const announcements = getAnnouncementsData().filter(a => a.id !== id);
  saveAnnouncementsData(announcements);
  return id;
}
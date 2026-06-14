/**
 * Attendance Service
 * Handles all Firestore operations for attendance tracking
 */

import {
  collection, addDoc, getDocs,
  updateDoc, deleteDoc, doc, query, where,
  orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION_NAME = 'attendance';

/**
 * Mark attendance for a student
 */
export async function markAttendance(studentId, date, status, studentName = '') {
  try {
    // Check if attendance already exists for this student on this date
    const existing = await getAttendanceByDate(date, studentId);

    if (existing.length > 0) {
      // Update existing attendance
      const attendanceDoc = existing[0];
      await updateDoc(doc(db, COLLECTION_NAME, attendanceDoc.id), {
        status,
        updatedAt: serverTimestamp(),
      });
      return { ...attendanceDoc, status };
    } else {
      // Create new attendance record
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        studentId,
        studentName,
        date,
        status,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, studentId, studentName, date, status };
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
}

/**
 * Get attendance records for a specific date
 */
export async function getAttendanceByDate(date, studentId = '') {
  try {
    let q;
    if (studentId) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('date', '==', date),
        where('studentId', '==', studentId)
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME),
        where('date', '==', date)
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting attendance:', error);
    throw error;
  }
}

/**
 * Get attendance history for a specific student
 */
export async function getStudentAttendanceHistory(studentId) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting attendance history:', error);
    throw error;
  }
}

/**
 * Get all attendance for a date range
 */
export async function getAttendanceByDateRange(startDate, endDate) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting attendance range:', error);
    throw error;
  }
}

/**
 * Calculate attendance percentage for a student
 */
export async function getAttendancePercentage(studentId) {
  try {
    const history = await getStudentAttendanceHistory(studentId);
    if (history.length === 0) return { percentage: 100, present: 0, total: 0 };

    const present = history.filter(a => a.status === 'present').length;
    const total = history.length;
    const percentage = Math.round((present / total) * 100);

    return { percentage, present, total };
  } catch (error) {
    console.error('Error calculating percentage:', error);
    return { percentage: 0, present: 0, total: 0 };
  }
}

/**
 * Get today's attendance summary
 */
export async function getTodayAttendance(todayDate) {
  try {
    const records = await getAttendanceByDate(todayDate);
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    return {
      total: records.length,
      present,
      absent,
      records,
    };
  } catch (error) {
    console.error('Error getting today attendance:', error);
    return { total: 0, present: 0, absent: 0, records: [] };
  }
}
/**
 * Leave Management Service
 * Handles all Firestore operations for leave applications
 */

import {
  collection, addDoc, getDocs,
  updateDoc, deleteDoc, doc, query, where,
  orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION_NAME = 'leaves';

/**
 * Apply for a new leave
 */
export async function applyLeave(leaveData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...leaveData,
      status: 'pending', // pending, approved, rejected
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...leaveData, status: 'pending' };
  } catch (error) {
    console.error('Error applying leave:', error);
    throw error;
  }
}

/**
 * Approve a leave request
 */
export async function approveLeave(id, approvedBy = '') {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status: 'approved',
      approvedBy,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id, status: 'approved' };
  } catch (error) {
    console.error('Error approving leave:', error);
    throw error;
  }
}

/**
 * Reject a leave request
 */
export async function rejectLeave(id, rejectionReason = '') {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status: 'rejected',
      rejectionReason,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id, status: 'rejected' };
  } catch (error) {
    console.error('Error rejecting leave:', error);
    throw error;
  }
}

/**
 * Get all leaves with optional filters
 */
export async function getLeaves(statusFilter = '', studentId = '') {
  try {
    let constraints = [];

    if (statusFilter) {
      constraints.push(where('status', '==', statusFilter));
    }
    if (studentId) {
      constraints.push(where('studentId', '==', studentId));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting leaves:', error);
    throw error;
  }
}

/**
 * Get pending leaves count
 */
export async function getPendingLeavesCount() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting pending count:', error);
    return 0;
  }
}
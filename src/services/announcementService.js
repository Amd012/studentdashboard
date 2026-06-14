/**
 * Announcement Service
 * Handles all Firestore operations for announcements
 */

import {
  collection, addDoc, getDocs,
  updateDoc, deleteDoc, doc, query,
  orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const COLLECTION_NAME = 'announcements';

/**
 * Create a new announcement
 */
export async function createAnnouncement(announcementData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...announcementData };
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

/**
 * Get all announcements
 */
export async function getAnnouncements() {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting announcements:', error);
    throw error;
  }
}

/**
 * Update an announcement
 */
export async function updateAnnouncement(id, announcementData) {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...announcementData,
      updatedAt: serverTimestamp(),
    });
    return { id, ...announcementData };
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}
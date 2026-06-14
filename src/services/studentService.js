/**
 * Student Service
 * Handles all Firestore CRUD operations for student data
 */

import { 
  collection, addDoc, getDoc, getDocs, 
  updateDoc, deleteDoc, doc, query, where,
  orderBy, Timestamp, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';

const COLLECTION_NAME = 'students';

/**
 * Get all students, optionally filtered by class
 */
export async function getStudents(classFilter = '') {
  try {
    let q;
    if (classFilter) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('class', '==', classFilter),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting students:', error);
    throw error;
  }
}

/**
 * Get a single student by ID
 */
export async function getStudentById(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting student:', error);
    throw error;
  }
}

/**
 * Add a new student
 * @param {Object} studentData - Student data excluding photo
 * @param {File} [photoFile] - Optional photo file to upload
 */
export async function addStudent(studentData, photoFile = null) {
  try {
    let photoURL = '';

    // Upload photo if provided
    if (photoFile) {
      photoURL = await uploadStudentPhoto(photoFile);
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...studentData,
      photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, ...studentData, photoURL };
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
}

/**
 * Update an existing student
 */
export async function updateStudent(id, studentData, photoFile = null) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);

    let photoURL = studentData.photoURL || '';

    // Upload new photo if provided
    if (photoFile) {
      // Delete old photo if exists
      if (studentData.photoURL) {
        await deleteStudentPhoto(studentData.photoURL);
      }
      photoURL = await uploadStudentPhoto(photoFile);
    }

    await updateDoc(docRef, {
      ...studentData,
      photoURL,
      updatedAt: serverTimestamp(),
    });

    return { id, ...studentData, photoURL };
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
}

/**
 * Delete a student
 */
export async function deleteStudent(id, photoURL = '') {
  try {
    // Delete photo if exists
    if (photoURL) {
      await deleteStudentPhoto(photoURL);
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
}

/**
 * Search students by name or ID
 */
export async function searchStudents(searchTerm) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side search
    const term = searchTerm.toLowerCase();
    return results.filter(student => 
      student.name?.toLowerCase().includes(term) ||
      student.studentId?.toLowerCase().includes(term) ||
      student.rollNumber?.toString().includes(term) ||
      student.phone?.includes(term)
    );
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
}

/**
 * Upload student photo to Firebase Storage
 */
async function uploadStudentPhoto(file) {
  const storageRef = ref(storage, `students/photos/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

/**
 * Delete student photo from Firebase Storage
 */
async function deleteStudentPhoto(photoURL) {
  try {
    const storageRef = ref(storage, photoURL);
    await deleteObject(storageRef);
  } catch (error) {
    // Ignore if file doesn't exist
    if (error.code !== 'storage/object-not-found') {
      console.error('Error deleting photo:', error);
    }
  }
}

/**
 * Get unique classes from students
 */
export async function getStudentClasses() {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const classes = new Set();
    querySnapshot.docs.forEach(doc => {
      if (doc.data().class) {
        classes.add(doc.data().class);
      }
    });
    return Array.from(classes).sort();
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
}

/**
 * Get student count
 */
export async function getStudentCount() {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting student count:', error);
    return 0;
  }
}
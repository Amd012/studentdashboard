/**
 * Students Page
 * Full CRUD operations for student management
 * Search, add, edit, delete, and view student profiles
 * Uses demo/localStorage (no Firebase required)
 */

import { useState, useEffect, useCallback } from 'react';
import { demoGetStudents, demoAddStudent, demoUpdateStudent, demoDeleteStudent, demoSearchStudents } from '../services/demoService';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    class: '',
    section: '',
    rollNumber: '',
    phone: '',
    email: '',
    address: '',
    fatherName: '',
    fatherContact: '',
    motherName: '',
    motherContact: '',
    guardianContact: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Load students
  const loadStudents = useCallback(() => {
    try {
      const data = demoGetStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Search handler
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (term.trim()) {
      setLoading(true);
      try {
        const results = demoSearchStudents(term);
        setStudents(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      loadStudents();
    }
  }, [loadStudents]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const openAddForm = () => {
    setEditingStudent(null);
    setFormData({
      name: '', studentId: '', class: '', section: '', rollNumber: '',
      phone: '', email: '', address: '', fatherName: '', fatherContact: '',
      motherName: '', motherContact: '', guardianContact: '',
    });
    setPhotoFile(null);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      studentId: student.studentId || '',
      class: student.class || '',
      section: student.section || '',
      rollNumber: student.rollNumber || '',
      phone: student.phone || '',
      email: student.email || '',
      address: student.address || '',
      fatherName: student.fatherName || '',
      fatherContact: student.fatherContact || '',
      motherName: student.motherName || '',
      motherContact: student.motherContact || '',
      guardianContact: student.guardianContact || '',
    });
    setPhotoFile(null);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Student name is required');
      return;
    }
    if (!formData.studentId.trim()) {
      setFormError('Student ID is required');
      return;
    }

    setSaving(true);
    try {
      // Convert photo to base64 if provided
      let photoURL = editingStudent?.photoURL || '';
      if (photoFile) {
        photoURL = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(photoFile);
        });
      }

      const dataToSave = { ...formData, photoURL };

      if (editingStudent) {
        demoUpdateStudent(editingStudent.id, dataToSave);
      } else {
        demoAddStudent(dataToSave);
      }
      setShowForm(false);
      loadStudents();
    } catch (error) {
      setFormError('Failed to save student. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;
    demoDeleteStudent(student.id);
    loadStudents();
  };

  // Form Modal
  const FormModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                {photoFile ? (
                  <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : editingStudent?.photoURL ? (
                  <img src={editingStudent.photoURL} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Personal details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID *</label>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                <input type="text" name="class" value={formData.class} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                <input type="text" name="section" value={formData.section} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Family details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Family Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Father Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Father Contact</label>
                <input type="tel" name="fatherContact" value={formData.fatherContact} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mother Name</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mother Contact</label>
                <input type="tel" name="motherContact" value={formData.motherContact} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guardian Contact</label>
                <input type="tel" name="guardianContact" value={formData.guardianContact} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
              {editingStudent ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // View Profile Modal
  const ViewProfile = ({ student, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Student Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Profile header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center overflow-hidden">
              {student.photoURL ? (
                <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {student.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{student.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {student.studentId}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Class {student.class} - Section {student.section} | Roll: {student.rollNumber}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem label="Phone" value={student.phone} />
              <InfoItem label="Email" value={student.email} />
              <InfoItem label="Address" value={student.address} className="sm:col-span-2" />
            </div>
          </div>

          {/* Family Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Family Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem label="Father Name" value={student.fatherName} />
              <InfoItem label="Father Contact" value={student.fatherContact} />
              <InfoItem label="Mother Name" value={student.motherName} />
              <InfoItem label="Mother Contact" value={student.motherContact} />
              <InfoItem label="Guardian Contact" value={student.guardianContact} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InfoItem = ({ label, value, className = '' }) => (
    <div className={className}>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, ID, or roll number..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={openAddForm}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first student.</p>
          <button onClick={openAddForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Add Student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div key={student.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {student.photoURL ? (
                    <img src={student.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-300">{student.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{student.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: {student.studentId}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p><span className="font-medium">Class:</span> {student.class} - {student.section}</p>
                <p><span className="font-medium">Roll:</span> {student.rollNumber}</p>
                <p><span className="font-medium">Phone:</span> {student.phone}</p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setViewingStudent(student)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  View
                </button>
                <button onClick={() => openEditForm(student)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(student)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && <FormModal />}
      {viewingStudent && <ViewProfile student={viewingStudent} onClose={() => setViewingStudent(null)} />}
    </div>
  );
}
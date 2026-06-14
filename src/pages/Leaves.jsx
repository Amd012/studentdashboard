/**
 * Leave Management Page
 * Apply for leave, approve/reject, view leave history
 * Uses demo/localStorage (no Firebase required)
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { demoApplyLeave, demoGetLeaves, demoApproveLeave, demoRejectLeave } from '../services/demoService';

export default function Leaves() {
  const { userData } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [formError, setFormError] = useState('');

  const isAdminOrTeacher = userData?.role === 'admin' || userData?.role === 'teacher';

  const loadLeaves = useCallback(() => {
    try {
      const data = demoGetLeaves(statusFilter);
      setLeaves(data);
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openApplyForm = () => {
    setFormData({
      studentName: userData?.displayName || '',
      studentId: '',
      leaveType: 'sick',
      startDate: '',
      endDate: '',
      reason: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.startDate || !formData.endDate) {
      setFormError('Please select start and end dates');
      return;
    }
    if (!formData.reason.trim()) {
      setFormError('Please provide a reason for leave');
      return;
    }

    setSaving(true);
    try {
      demoApplyLeave({
        ...formData,
        studentId: formData.studentId || userData?.uid || 'unknown',
        appliedBy: userData?.displayName || 'Unknown',
        appliedByRole: userData?.role || 'student',
      });
      setShowForm(false);
      loadLeaves();
    } catch (error) {
      setFormError('Failed to apply for leave');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = (id) => {
    demoApproveLeave(id, userData?.displayName);
    loadLeaves();
  };

  const handleReject = (id) => {
    const reason = window.prompt('Reason for rejection (optional):');
    demoRejectLeave(id, reason || '');
    loadLeaves();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Approved</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filter === '' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={openApplyForm}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Apply Leave
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Leave Applications</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {statusFilter ? `No ${statusFilter} leave applications found.` : 'No leave applications have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div key={leave.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{leave.studentName || leave.appliedBy}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {leave.leaveType?.charAt(0).toUpperCase() + leave.leaveType?.slice(1)} Leave
                    {leave.studentId && ` · ID: ${leave.studentId}`}
                  </p>
                </div>
                {getStatusBadge(leave.status)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{leave.startDate || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{leave.endDate || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Applied By</p>
                  <p className="font-medium text-gray-900 dark:text-white">{leave.appliedBy || '-'}</p>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reason</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{leave.reason || 'No reason provided'}</p>
              </div>
              {leave.rejectionReason && (
                <div className="mb-3">
                  <p className="text-xs text-red-500 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{leave.rejectionReason}</p>
                </div>
              )}
              {leave.status === 'pending' && isAdminOrTeacher && (
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => handleApprove(leave.id)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">Approve</button>
                  <button onClick={() => handleReject(leave.id)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Reject</button>
                </div>
              )}
              {leave.approvedBy && leave.status === 'approved' && (
                <p className="text-xs text-green-600 dark:text-green-400 pt-2 border-t border-gray-100 dark:border-gray-700">Approved by {leave.approvedBy}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Apply for Leave</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{formError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Name</label>
                <input type="text" name="studentName" value={formData.studentName} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                <select name="leaveType" value={formData.leaveType} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="vacation">Vacation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Please describe your reason for leave..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
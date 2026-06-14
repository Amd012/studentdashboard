/**
 * Attendance Page
 * Mark present/absent, view history, attendance percentage
 * Uses demo/localStorage (no Firebase required)
 */

import { useState, useEffect, useCallback } from 'react';
import { demoGetStudents } from '../services/demoService';
import { demoMarkAttendance, demoGetAttendanceByDate, demoGetStudentAttendanceHistory } from '../services/demoService';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [viewHistory, setViewHistory] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const studentsData = demoGetStudents();
      setStudents(studentsData);

      const attendanceData = demoGetAttendanceByDate(selectedDate);
      const attendanceMap = {};
      attendanceData.forEach(a => {
        attendanceMap[a.studentId] = a.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMark = (studentId, status, studentName) => {
    setSaving(true);
    try {
      demoMarkAttendance(studentId, selectedDate, status, studentName);
      setAttendance(prev => ({ ...prev, [studentId]: status }));
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleViewHistory = (student) => {
    setViewHistory(student);
    try {
      const history = demoGetStudentAttendanceHistory(student.id);
      const total = history.length;
      const present = history.filter(h => h.status === 'present').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      setHistoryData({ records: history, total, present, absent: total - present, percentage });
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const presentCount = students.filter(s => attendance[s.id] === 'present').length;
  const absentCount = students.filter(s => attendance[s.id] === 'absent').length;
  const unmarkedCount = students.length - presentCount - absentCount;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={students.length} color="blue" />
        <StatCard title="Present" value={presentCount} color="green" />
        <StatCard title="Absent" value={absentCount} color="red" />
        <StatCard title="Unmarked" value={unmarkedCount} color="yellow" />
      </div>

      {/* Date picker */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
          {isToday && (
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Student attendance list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student) => {
                  const status = attendance[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-bold">
                            {student.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.class} - {student.section}</td>
                      <td className="px-4 py-3 text-center">
                        {status === 'present' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Present</span>
                        ) : status === 'absent' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Absent</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Not Marked</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleMark(student.id, 'present', student.name)}
                            disabled={saving || status === 'present'}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              status === 'present'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default'
                                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                            }`}
                          >Present</button>
                          <button
                            onClick={() => handleMark(student.id, 'absent', student.name)}
                            disabled={saving || status === 'absent'}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              status === 'absent'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 cursor-default'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                            }`}
                          >Absent</button>
                          <button
                            onClick={() => handleViewHistory(student)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >History</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Modal */}
      {viewHistory && historyData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewHistory(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{viewHistory.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance History</p>
              </div>
              <button onClick={() => setViewHistory(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{historyData.total}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Total</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">{historyData.present}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Present</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-300">{historyData.absent}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Absent</p>
                </div>
              </div>
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Percentage</p>
                <p className={`text-3xl font-bold ${historyData.percentage >= 75 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {historyData.percentage}%
                </p>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Records</h3>
              <div className="space-y-2">
                {historyData.records.slice(0, 20).map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{record.date}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      record.status === 'present'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {record.status === 'present' ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
                {historyData.records.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No attendance records found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
/**
 * Firebase Cloud Functions for Student Management System
 * 
 * Features:
 * - Send attendance alerts via email
 * - Send leave approval/rejection emails
 * - Send announcement emails
 * 
 * Setup:
 * 1. Enable Gmail SMTP in your Google Account
 * 2. Set environment variables:
 *    firebase functions:config:set smtp.host="smtp.gmail.com" smtp.port="587" smtp.user="your-email@gmail.com" smtp.pass="your-app-password"
 * 3. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Get SMTP config from Firebase environment
const smtpConfig = {
  host: functions.config().smtp?.host || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(functions.config().smtp?.port || process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: functions.config().smtp?.user || process.env.SMTP_USER || '',
    pass: functions.config().smtp?.pass || process.env.SMTP_PASS || '',
  },
};

// Create transporter
const transporter = nodemailer.createTransport(smtpConfig);

/**
 * Verify transporter connection
 */
async function verifyTransporter() {
  try {
    await transporter.verify();
    console.log('SMTP connection verified');
    return true;
  } catch (error) {
    console.error('SMTP verification failed:', error.message);
    return false;
  }
}

/**
 * Send email helper
 */
async function sendEmail({ to, subject, html }) {
  try {
    const mailOptions = {
      from: `"Student Management System" <${smtpConfig.auth.user}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get parent/student emails from Firestore
 */
async function getRecipientEmails(studentId) {
  try {
    const studentDoc = await admin.firestore().collection('students').doc(studentId).get();
    if (!studentDoc.exists) return [];

    const student = studentDoc.data();
    const emails = [];

    if (student.email) emails.push(student.email);
    if (student.parentEmail) emails.push(student.parentEmail);

    return emails;
  } catch (error) {
    console.error('Error getting recipient emails:', error);
    return [];
  }
}

/**
 * Get all student emails (for mass announcements)
 */
async function getAllStudentEmails() {
  try {
    const snapshot = await admin.firestore().collection('students').get();
    const emails = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.email) emails.push(data.email);
      if (data.parentEmail) emails.push(data.parentEmail);
    });
    return [...new Set(emails)]; // Remove duplicates
  } catch (error) {
    console.error('Error getting all student emails:', error);
    return [];
  }
}

/**
 * Format date nicely
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ==========================================
// TRIGGERED FUNCTIONS
// ==========================================

/**
 * Triggered when attendance is marked
 * Sends alert to parent/student if absent
 */
exports.onAttendanceMarked = functions.firestore
  .document('attendance/{attendanceId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Only send alert if absent
    if (data.status !== 'absent') return;
    
    const emails = await getRecipientEmails(data.studentId);
    if (emails.length === 0) return;

    const subject = `Attendance Alert - ${data.studentName || 'Student'}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">Attendance Alert</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p>Dear Parent/Guardian,</p>
          <p>This is to inform you that <strong>${data.studentName || 'your ward'}</strong> was marked <strong style="color: #dc2626;">ABSENT</strong> on <strong>${formatDate(data.date)}</strong>.</p>
          <p>Please ensure regular attendance.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from your Student Management System.</p>
        </div>
      </div>
    `;

    return sendEmail({ to: emails.join(','), subject, html });
  });

/**
 * Triggered when leave status changes
 * Sends approval/rejection email
 */
exports.onLeaveStatusChanged = functions.firestore
  .document('leaves/{leaveId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Only send email if status changed
    if (beforeData.status === afterData.status) return;
    if (!['approved', 'rejected'].includes(afterData.status)) return;

    const emails = await getRecipientEmails(afterData.studentId);
    if (emails.length === 0) {
      // If no student found, try to use the leave document fields
      if (afterData.email) emails.push(afterData.email);
    }
    if (emails.length === 0) return;

    const isApproved = afterData.status === 'approved';
    const subject = `Leave ${isApproved ? 'Approved' : 'Rejected'} - ${afterData.studentName || 'Leave Application'}`;
    
    const statusColor = isApproved ? '#16a34a' : '#dc2626';
    const statusEmoji = isApproved ? '✅' : '❌';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">Leave ${isApproved ? 'Approved' : 'Rejected'}</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <p>Dear ${afterData.studentName || 'Student'},</p>
          <p>Your leave application has been <strong style="color: ${statusColor};">${isApproved ? 'APPROVED' : 'REJECTED'}</strong> ${statusEmoji}</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Leave Type:</strong> ${afterData.leaveType || 'N/A'}</p>
            <p><strong>Start Date:</strong> ${formatDate(afterData.startDate)}</p>
            <p><strong>End Date:</strong> ${formatDate(afterData.endDate)}</p>
            <p><strong>Reason:</strong> ${afterData.reason || 'N/A'}</p>
            ${afterData.rejectionReason ? `<p><strong>Rejection Reason:</strong> ${afterData.rejectionReason}</p>` : ''}
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from your Student Management System.</p>
        </div>
      </div>
    `;

    return sendEmail({ to: emails.join(','), subject, html });
  });

/**
 * Triggered when a new announcement is created
 * Sends notification email to all students/parents
 */
exports.onAnnouncementCreated = functions.firestore
  .document('announcements/{announcementId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const emails = await getAllStudentEmails();
    
    if (emails.length === 0) return;

    const subject = `📢 ${data.title || 'New Announcement'}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">📢 New Announcement</h2>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h3 style="color: #111827; margin-top: 0;">${data.title || 'Untitled'}</h3>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${data.description || 'No description provided.'}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Posted on: ${formatDate(data.date)} | By: ${data.createdBy || 'Administrator'}
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">This is an automated message from your Student Management System.</p>
        </div>
      </div>
    `;

    return sendEmail({ to: emails.join(','), subject, html });
  });

// ==========================================
// CALLABLE FUNCTIONS
// ==========================================

/**
 * Send custom email (callable function)
 * Can be called from the client SDK
 */
exports.sendCustomEmail = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check admin role
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (userRole !== 'admin' && userRole !== 'teacher') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins and teachers can send emails');
  }

  const { to, subject, html } = data;

  if (!to || !subject || !html) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: to, subject, html');
  }

  return sendEmail({ to, subject, html });
});

/**
 * Test email configuration (callable function - admin only)
 */
exports.testEmailConfig = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (userDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can test email config');
  }

  const isVerified = await verifyTransporter();
  
  if (isVerified) {
    // Send test email
    const result = await sendEmail({
      to: data.email || smtpConfig.auth.user,
      subject: 'Test Email from Student Management System',
      html: '<h2>✅ Email Configuration Working!</h2><p>This is a test email from your Student Management System.</p>',
    });

    return { success: result.success, message: result.success ? 'Test email sent successfully' : 'Failed to send test email' };
  }

  return { success: false, message: 'SMTP configuration is invalid' };
});
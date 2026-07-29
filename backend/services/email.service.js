const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      replyTo: replyTo || process.env.EMAIL_USER,
      subject,
      text: text || subject,
      html,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`
      }
    });
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    return false;
  }
};

const sendTaskNotification = async (user, task) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Task Created</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">${task.title}</h2>
        ${task.description ? `<p style="color: #64748b;">${task.description}</p>` : ''}
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; color: #64748b;">Priority</td>
            <td style="padding: 8px;"><strong>${task.priority}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #64748b;">Status</td>
            <td style="padding: 8px;"><strong>${task.status}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #64748b;">Category</td>
            <td style="padding: 8px;"><strong>${task.category}</strong></td>
          </tr>
          ${task.dueDate ? `<tr><td style="padding: 8px; color: #64748b;">Due Date</td><td style="padding: 8px;"><strong>${new Date(task.dueDate).toLocaleDateString()}</strong></td></tr>` : ''}
        </table>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">Student Portal - Manage your academic life</p>
      </div>
    </div>
  `;
  return sendEmail({ 
    to: user.email, 
    subject: `New Task Created: ${task.title}`, 
    text: `New Task: ${task.title}. Priority: ${task.priority}, Status: ${task.status}.`,
    html 
  });
};

const sendNoteNotification = async (user, note) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background: #8b5cf6; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">New Note Created</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">${note.title}</h2>
        ${note.content ? `<p style="color: #64748b;">${note.content.substring(0, 200)}${note.content.length > 200 ? '...' : ''}</p>` : ''}
        ${note.subject ? `<p style="margin-top: 10px;"><strong>Subject:</strong> ${note.subject}</p>` : ''}
        ${note.tags && note.tags.length > 0 ? `<p><strong>Tags:</strong> ${note.tags.join(', ')}</p>` : ''}
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">Student Portal - Manage your academic life</p>
      </div>
    </div>
  `;
  return sendEmail({ 
    to: user.email, 
    subject: `New Note Added: ${note.title}`, 
    text: `New Note Added: ${note.title}. Subject: ${note.subject || 'N/A'}`,
    html 
  });
};

const sendTaskReminder = async (user, task) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Task Due Reminder</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #1e293b; margin-top: 0;">${task.title}</h2>
        <p style="color: #dc2626; font-weight: bold;">This task is due in less than 24 hours!</p>
        ${task.description ? `<p style="color: #64748b;">${task.description}</p>` : ''}
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; color: #64748b;">Due Date</td>
            <td style="padding: 8px;"><strong>${new Date(task.dueDate).toLocaleDateString()}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #64748b;">Priority</td>
            <td style="padding: 8px;"><strong>${task.priority}</strong></td>
          </tr>
        </table>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">Student Portal - Manage your academic life</p>
      </div>
    </div>
  `;
  return sendEmail({ 
    to: user.email, 
    subject: `Reminder: Task "${task.title}" is due soon`, 
    text: `Reminder: Your task "${task.title}" is due within 24 hours.`,
    html 
  });
};

const sendOtpEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Email Verification</h1>
      </div>
      <div style="padding: 20px; text-align: center;">
        <p style="color: #64748b; font-size: 16px;">Your verification code for Student Portal</p>
        <div style="background: #f0f5ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #2563eb; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">This code will expire in <strong>5 minutes</strong></p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">Student Portal - Manage your academic life</p>
      </div>
    </div>
  `;
  return sendEmail({ 
    to: email, 
    subject: 'Student Portal Verification Code', 
    text: `Your Student Portal verification code is: ${otp}. It expires in 5 minutes.`,
    html 
  });
};

module.exports = { sendEmail, sendTaskNotification, sendNoteNotification, sendTaskReminder, sendOtpEmail };
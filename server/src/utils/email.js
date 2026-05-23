const nodemailer = require("nodemailer");


const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email.
 * @param {object} options
 * @param {string} options.to       - Recipient email address
 * @param {string} options.subject  - Email subject line
 * @param {string} options.html     - HTML body
 * @param {string} [options.text]   - Plain-text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "Beauty Rocks"}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""), 
  };
//Log in consola pentru verificarea daca emailul a fost transmis si unde:
  const info = await transporter.sendMail(mailOptions);
  console.log(`  Email sent to ${to} — Message ID: ${info.messageId}`);
  return info;
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fdf6f9; margin: 0; padding: 0; }
        .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(212,73,122,0.10); }
        .header { background: linear-gradient(135deg, #d4497a 0%, #e8789a 100%); padding: 36px 32px 28px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 32px; }
        .body p { color: #555; line-height: 1.7; font-size: 15px; margin: 0 0 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #d4497a, #e8789a); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
        .note { font-size: 13px; color: #999; border-top: 1px solid #f0e0e8; padding-top: 20px; margin-top: 8px; }
        .footer { text-align: center; padding: 20px 32px; font-size: 12px; color: #bbb; background: #fdf6f9; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>💄 Beauty Rocks</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="body">
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>We received a request to reset the password for your Beauty Rocks account. Click the button below to choose a new password:</p>
          <div style="text-align:center">
            <a class="btn" href="${resetURL}">Reset My Password</a>
          </div>
          <p>This link is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will not change.</p>
          <p class="note">If the button doesn't work, copy and paste this URL into your browser:<br /><a href="${resetURL}" style="color:#d4497a;word-break:break-all">${resetURL}</a></p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} Beauty Rocks. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "Reset your Beauty Rocks password (valid 10 min)",
    html,
  });
};


const sendEmailVerificationEmail = async (user, verificationToken) => {
  const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fdf6f9; margin: 0; padding: 0; }
        .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(212,73,122,0.10); }
        .header { background: linear-gradient(135deg, #d4497a 0%, #e8789a 100%); padding: 36px 32px 28px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
        .body { padding: 36px 32px; }
        .body p { color: #555; line-height: 1.7; font-size: 15px; margin: 0 0 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #d4497a, #e8789a); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
        .note { font-size: 13px; color: #999; border-top: 1px solid #f0e0e8; padding-top: 20px; margin-top: 8px; }
        .footer { text-align: center; padding: 20px 32px; font-size: 12px; color: #bbb; background: #fdf6f9; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>💄 Beauty Rocks</h1>
          <p>Welcome! Verify your email</p>
        </div>
        <div class="body">
          <p>Hi <strong>${user.username}</strong>, welcome to Beauty Rocks! 🎉</p>
          <p>Please verify your email address to activate your account and start booking appointments.</p>
          <div style="text-align:center">
            <a class="btn" href="${verifyURL}">Verify Email Address</a>
          </div>
          <p>This link is valid for <strong>24 hours</strong>.</p>
          <p class="note">If the button doesn't work, copy and paste this URL:<br /><a href="${verifyURL}" style="color:#d4497a;word-break:break-all">${verifyURL}</a></p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} Beauty Rocks. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "Verify your Beauty Rocks email address",
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
};
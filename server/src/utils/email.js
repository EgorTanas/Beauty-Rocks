const { sendEmail } = require('../services/emailService');

const buildShell = ({ title, eyebrow, body, buttonLabel, buttonUrl }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { margin: 0; background: #f7f1ef; font-family: Arial, Helvetica, sans-serif; }
        .wrap { padding: 32px 16px; }
        .card { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(82, 39, 24, 0.12); }
        .hero { background: linear-gradient(135deg, #1f1715 0%, #7f5b45 100%); color: #fff; padding: 34px; }
        .hero h1 { margin: 0; font-size: 30px; }
        .hero p { margin: 8px 0 0; color: rgba(255,255,255,.82); }
        .content { padding: 34px; color: #2a201d; line-height: 1.7; font-size: 15px; }
        .btn { display: inline-block; margin-top: 18px; background: linear-gradient(135deg, #caa27f 0%, #8f6248 100%); color: #fff !important; text-decoration: none; font-weight: 700; padding: 14px 24px; border-radius: 999px; }
        .footer { background: #fcf8f5; padding: 22px 34px 30px; color: #7f6d66; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <div class="hero">
            <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.8;">Beauty Rocks</div>
            <h1>${title}</h1>
            <p>${eyebrow}</p>
          </div>
          <div class="content">
            ${body}
            ${buttonLabel && buttonUrl ? `<a class="btn" href="${buttonUrl}">${buttonLabel}</a>` : ''}
          </div>
          <div class="footer">© ${new Date().getFullYear()} Beauty Rocks. All rights reserved.</div>
        </div>
      </div>
    </body>
  </html>
`;

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const html = buildShell({
    title: 'Reset your Beauty Rocks password',
    eyebrow: 'Password reset request',
    body: `
      <p>Hi <strong>${user.username}</strong>,</p>
      <p>We received a request to reset the password for your Beauty Rocks account. Use the button below to choose a new password.</p>
      <p>This link is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can ignore this email.</p>
    `,
    buttonLabel: 'Reset My Password',
    buttonUrl: resetURL,
  });

  return sendEmail({
    to: user.email,
    subject: 'Reset your Beauty Rocks password (valid 10 min)',
    html,
  });
};

const sendEmailVerificationEmail = async (user, verificationToken) => {
  const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const html = buildShell({
    title: 'Verify your Beauty Rocks email',
    eyebrow: 'Welcome to Beauty Rocks',
    body: `
      <p>Hi <strong>${user.username}</strong>, welcome to Beauty Rocks!</p>
      <p>Please verify your email address to activate your account and start booking appointments.</p>
      <p>This link is valid for <strong>24 hours</strong>.</p>
    `,
    buttonLabel: 'Verify Email Address',
    buttonUrl: verifyURL,
  });

  return sendEmail({
    to: user.email,
    subject: 'Verify your Beauty Rocks email address',
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
};

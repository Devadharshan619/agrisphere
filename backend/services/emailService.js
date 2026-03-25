const nodemailer = require("nodemailer");

// For development, we use ethereal.email or a local mock
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'mock_user@ethereal.email',
    pass: process.env.SMTP_PASS || 'mock_pass'
  }
});

exports.sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"AgriSphere Support" <support@agrisphere.com>',
      to,
      subject,
      html
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
  }
};

exports.getRegistrationTemplate = (name) => `
  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #6A994E; border-radius: 10px;">
    <h1 style="color: #6A994E;">Welcome to AgriSphere, ${name}!</h1>
    <p>Your agricultural intelligence dashboard is ready.</p>
    <a href="http://localhost:3000/dashboard" style="background: #6A994E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
  </div>
`;

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Transporter
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Dynamic mail options
export const mailOptions = (email, name) => ({
  from: `"Your Website" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Welcome to Our Website!",
  html: `
    <h2>Hello ${name},</h2>
    <p>Thank you for registering on our website.</p>
    <p>We're excited to have you on board! 🎉</p>
  `,
});

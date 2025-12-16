import express from "express";
import ContactMessage from "../models/serviceContactMessage.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Email transporter configuration
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

console.log("Email Configuration Check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***" : "Not set");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Changed from 465 to 587
  secure: false, // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email server connection failed:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Send email notification to ADMIN (you)
const sendEmailNotification = async (contactData) => {
  try {
    const mailOptions = {
      from: `${contactData.email}`,
      to: process.env.EMAIL_USER, 
      subject: `📨 New Contact Form - ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 10px;">New Contact Form Submission</h2>
            <p style="color: #666; margin-bottom: 20px;">Submitted: ${new Date().toLocaleString()}</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; width: 120px;"><strong>Name:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${
                    contactData.name
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <a href="mailto:${
                      contactData.email
                    }" style="color: #d97706;">${contactData.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <a href="tel:${
                      contactData.phone
                    }" style="color: #d97706;">${contactData.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px;"><strong>Message:</strong></td>
                  <td style="padding: 10px;">${contactData.message}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #d97706;">
              <p style="margin: 0; color: #333;">
                <strong>Quick Actions:</strong><br>
                • <a href="mailto:${
                  contactData.email
                }?subject=RE: Your inquiry to SECURENET" style="color: #d97706;">Reply to ${
        contactData.name
      }</a><br>
                • <a href="tel:${
                  contactData.phone
                }" style="color: #d97706;">Call ${contactData.name}</a>
              </p>
            </div>
            
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Contact form email sent successfully to ADMIN:");
    console.log("Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email sending failed:");
    console.error("Error:", error.message);
    return false;
  }
};
// Submit contact form
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log("Received form submission:", { name, email, phone });

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      message,
    });

    const savedMessage = await contactMessage.save();
    console.log("Saved to MongoDB with ID:", savedMessage._id);

    // Send email and wait for result
    const emailSent = await sendEmailNotification(savedMessage);
    console.log("Email sending result:", emailSent ? "Success" : "Failed");

    // Update the document with email status
    if (emailSent) {
      savedMessage.emailSent = true;
      savedMessage.emailSentAt = new Date();
      await savedMessage.save();
    }

    res.status(201).json({
      success: true,
      message: "Message submitted successfully! We will contact you soon.",
      data: {
        id: savedMessage._id,
        name: savedMessage.name,
        email: savedMessage.email,
        submittedAt: savedMessage.createdAt,
        emailSent: emailSent,
      },
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

router.get("/messages", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      data: messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/messages/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (status) message.status = status;
    if (adminNotes !== undefined) message.adminNotes = adminNotes;

    await message.save();

    res.json({
      success: true,
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;

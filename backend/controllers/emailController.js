import { sendBulkEmails, sendEmailTOther } from '../config/email.js';
import AuthModel from '../models/authModel.js';

// Send announcement email to users
export const sendAnnouncementEmail = async (req, res) => {
  try {
    const { recipientType, specificEmails, subject, content } = req.body;

    // Validate required fields
    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: "Subject and content are required"
      });
    }

    // Get recipients based on type
    let recipients = [];
    
    if (recipientType === "specific_emails" && specificEmails) {
      // Use specific email addresses
      recipients = specificEmails.map(email => ({ 
        email: email.trim(),
        name: "Valued Customer" 
      }));
    } else {
      // Get users from database based on type
      let userQuery = {};
      
      if (recipientType === "customers_only") {
        userQuery = { userRole: "user" };
      } else if (recipientType === "vendors_only") {
        userQuery = { userRole: "vendor" };
      }
      // "all_users" gets all users (no query filter)

      const users = await AuthModel.find(userQuery).select("email name");
      recipients = users.map(user => ({
        email: user.email,
        name: user.name || "Valued Customer"
      }));
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No recipients found for the selected criteria"
      });
    }

    console.log(`📧 Starting to send email to ${recipients.length} recipients`);

    // Send emails
    const results = await sendBulkEmails(recipients, subject, content, 500);
    
    console.log(`✅ Email campaign completed: ${results.sent} sent, ${results.failed} failed`);

    // Return final results
    if (results.failed > 0) {
      return res.json({
        success: true,
        message: `Email sent partially! ${results.sent} delivered, ${results.failed} failed`,
        stats: {
          total: recipients.length,
          sent: results.sent,
          failed: results.failed
        }
      });
    } else {
      return res.json({
        success: true,
        message: `Email sent successfully! All ${results.sent} emails delivered`,
        stats: {
          total: recipients.length,
          sent: results.sent,
          failed: results.failed
        }
      });
    }

  } catch (error) {
    console.error("Send announcement email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send announcement email: " + error.message
    });
  }
};

// Simple test email function
export const sendTestEmail = async (req, res) => {
  try {
    const { email, subject, content } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Test email address is required"
      });
    }

    const { sendEmailTOther } = require('../config/email');
    
    const result = await sendEmailTOther(
      email,
      subject || "Test Email from Admin Panel",
      content || "This is a test email to verify your email configuration is working correctly.",
      "Test User"
    );

    if (result.success) {
      res.json({
        success: true,
        message: "Test email sent successfully!"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test email: " + result.error
      });
    }

  } catch (error) {
    console.error("Send test email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email: " + error.message
    });
  }
};



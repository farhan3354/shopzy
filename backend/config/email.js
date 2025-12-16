import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: html.replace(/<[^>]*>/g, ""),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

export const emailTemplates = {
  verificationEmail: (name, verificationUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin: 0;">Verify Your Account</h1>
      </div>
      
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Hello <strong>${name}</strong>,
      </p>
      
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below:
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
          Verify My Account
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.5;">
        Or copy and paste this link in your browser:
      </p>
      
      <p style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #333;">
        ${verificationUrl}
      </p>
      
      <p style="color: #999; font-size: 12px; line-height: 1.5;">
        <strong>Important:</strong> This verification link will expire in 24 hours.
      </p>
      
      <p style="color: #999; font-size: 12px; line-height: 1.5;">
        If you didn't create an account with us, please ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #999; font-size: 11px; text-align: center;">
        If you're having trouble clicking the button, copy and paste the URL above into your web browser.
      </p>
    </div>
  `,

  welcomeEmail: (name, loginUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #28a745; margin: 0;">Welcome Aboard! 🎉</h1>
      </div>
      
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Hello <strong>${name}</strong>,
      </p>
      
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Your account has been successfully verified and is now active! You can now log in and start using our platform.
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${loginUrl}" 
           style="background-color: #28a745; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
          Login to Your Account
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.5;">
        We're excited to have you on board! If you have any questions, feel free to contact our support team.
      </p>
    </div>
  `,
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Auto-generate beautiful HTML template
export const generateEmailTemplate = (
  subject,
  content,
  recipientName = "Valued Customer"
) => {
  // Convert plain text to HTML paragraphs
  const formattedContent = content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      // Convert bullet points to proper list items
      if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
        return `<li>${line.trim().substring(1).trim()}</li>`;
      }
      return `<p>${line}</p>`;
    })
    .join("");

  // Check if we have list items and wrap them in ul
  const finalContent = formattedContent.includes("<li>")
    ? formattedContent.replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>")
    : formattedContent;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #374151;
      background: #f9fafb;
      margin: 0;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    
    .email-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.025em;
    }
    
    .email-header p {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 400;
    }
    
    .email-body {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
    }
    
    .content {
      font-size: 16px;
      line-height: 1.7;
      color: #4b5563;
      margin-bottom: 30px;
    }
    
    .content p {
      margin-bottom: 16px;
    }
    
    .content ul {
      margin: 16px 0;
      padding-left: 24px;
    }
    
    .content li {
      margin-bottom: 8px;
    }
    
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.4);
    }
    
    .email-footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      margin: 0 10px;
      color: #6b7280;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    
    .social-link:hover {
      color: #4F46E5;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .company-name {
      font-weight: 600;
      color: #374151;
    }
    
    .unsubscribe {
      margin-top: 15px;
      font-size: 12px;
      color: #9ca3af;
    }
    
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      
      .email-header {
        padding: 30px 20px;
      }
      
      .email-header h1 {
        font-size: 24px;
      }
      
      .email-body {
        padding: 30px 20px;
      }
      
      .cta-button {
        padding: 12px 24px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1>${subject}</h1>
      <p>Important Update from Our Team</p>
    </div>
    
    <!-- Body -->
    <div class="email-body">
      <div class="greeting">
        Hello ${recipientName},
      </div>
      
      <div class="content">
        ${finalContent}
      </div>
      
      <!-- Optional CTA Button -->
      <div class="cta-section">
        <a href="${
          process.env.CLIENT_URL || "https://yourwebsite.com"
        }" class="cta-button">
          Visit Our Website
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="email-footer">
      <div class="social-links">
        <a href="#" class="social-link">Facebook</a>
        <a href="#" class="social-link">Instagram</a>
        <a href="#" class="social-link">Twitter</a>
        <a href="#" class="social-link">LinkedIn</a>
      </div>
      
      <div class="footer-text">
        <p class="company-name">${
          process.env.COMPANY_NAME || "Your Company Name"
        }</p>
        <p>${
          process.env.COMPANY_ADDRESS ||
          "123 Business Street, City, State 12345"
        }</p>
        <p>Email: ${
          process.env.COMPANY_EMAIL || "hello@yourcompany.com"
        } | Phone: ${process.env.COMPANY_PHONE || "(123) 456-7890"}</p>
        
        <div class="unsubscribe">
          <p>© ${new Date().getFullYear()} ${
    process.env.COMPANY_NAME || "Your Company Name"
  }. All rights reserved.</p>
          <p>
            <a href="${
              process.env.CLIENT_URL || "https://yourwebsite.com"
            }/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | 
            <a href="${
              process.env.CLIENT_URL || "https://yourwebsite.com"
            }/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Send email function
export const sendEmailTOther = async (
  to,
  subject,
  content,
  recipientName = null
) => {
  try {
    const transporter = createTransporter();

    const htmlContent = generateEmailTemplate(subject, content, recipientName);

    // Create better plain text version
    const textContent = content
      .replace(/•\s*/g, "- ") // Convert bullet points
      .replace(/\n\s*\n/g, "\n\n"); // Normalize line breaks

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "Your Company"}" <${
        process.env.EMAIL_FROM
      }>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

// Send bulk emails
export const sendBulkEmails = async (
  recipients,
  subject,
  content,
  delayMs = 500
) => {
  const results = {
    sent: 0,
    failed: 0,
    details: [],
  };

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    try {
      const result = await sendEmailTOther(
        recipient.email,
        subject,
        content,
        recipient.name
      );

      if (result.success) {
        results.sent++;
        results.details.push({
          email: recipient.email,
          name: recipient.name,
          status: "sent",
          messageId: result.messageId,
        });
      } else {
        results.failed++;
        results.details.push({
          email: recipient.email,
          name: recipient.name,
          status: "failed",
          error: result.error,
        });
      }

      // Add delay between emails to avoid rate limiting
      if (i < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      results.failed++;
      results.details.push({
        email: recipient.email,
        name: recipient.name,
        status: "failed",
        error: error.message,
      });
    }
  }

  return results;
};

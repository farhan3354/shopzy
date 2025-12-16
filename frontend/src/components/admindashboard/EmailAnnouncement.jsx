import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../utils/api";

const EmailAnnouncement = () => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("compose");

  const [formData, setFormData] = useState({
    recipientType: "all_users",
    specificEmails: "",
    subject: "",
    content: "",
  });

  const [testData, setTestData] = useState({
    email: "",
    subject: "Test Email from Admin Panel",
    content:
      "This is a test email to verify your email configuration is working correctly.",
  });

  const token = useSelector((state) => state.auth.token);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestInputChange = (field, value) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendEmail = async () => {
    if (!formData.subject || !formData.content) {
      setMessage("Subject and content are required");
      return;
    }

    try {
      setSending(true);
      setMessage("");

      // Prepare recipients
      const specificEmails = formData.specificEmails
        ? formData.specificEmails
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email)
        : [];

      // Prepare data
      const emailData = {
        recipientType: formData.recipientType,
        subject: formData.subject,
        content: formData.content,
      };

      // Only add specificEmails if provided and recipient type is specific_emails
      if (
        formData.recipientType === "specific_emails" &&
        specificEmails.length > 0
      ) {
        emailData.specificEmails = specificEmails;
      }

      // Send email
      const response = await api.post("/email/send", emailData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessage(`✅ ${response.data.message}`);
        setFormData({
          recipientType: "all_users",
          specificEmails: "",
          subject: "",
          content: "",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setMessage(
        "❌ Failed to send email: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSending(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testData.email) {
      setMessage("Please enter a test email address");
      return;
    }

    try {
      setSending(true);
      const response = await api.post(
        "/email/test",
        {
          email: testData.email,
          subject: testData.subject,
          content: testData.content,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessage("✅ Test email sent successfully!");
        setTestData((prev) => ({
          ...prev,
          email: "",
        }));
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      setMessage(
        "❌ Failed to send test email: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Email Announcements</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "compose"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("compose")}
        >
          Send Email
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "test"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("test")}
        >
          Test Email
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 mb-4 rounded ${
            message.includes("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Compose Email Tab */}
      {activeTab === "compose" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Send Email to Users</h2>

          {/* Recipient Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Send To</label>
            <select
              value={formData.recipientType}
              onChange={(e) =>
                handleInputChange("recipientType", e.target.value)
              }
              className="w-full p-2 border rounded mb-2"
            >
              <option value="all_users">All Users</option>
              <option value="customers_only">Customers Only</option>
              <option value="vendors_only">Vendors Only</option>
              <option value="specific_emails">Specific Emails</option>
            </select>

            {formData.recipientType === "specific_emails" && (
              <div>
                <textarea
                  placeholder="Enter email addresses separated by commas"
                  value={formData.specificEmails}
                  onChange={(e) =>
                    handleInputChange("specificEmails", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  rows="3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: user1@example.com, user2@example.com
                </p>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter email subject..."
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Message Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className="w-full p-2 border rounded"
              rows="12"
              placeholder="Write your announcement message here...

You can write in plain text - we'll automatically format it beautifully!

• Use bullet points for lists
• Add line breaks for paragraphs
• Keep it clear and engaging

Your message will be wrapped in a professional email template automatically."
            />
          </div>

          <button
            onClick={handleSendEmail}
            disabled={sending || !formData.subject || !formData.content}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Email to Users"}
          </button>
        </div>
      )}

      {/* Test Email Tab */}
      {activeTab === "test" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Test Email Configuration
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Test Email Address *
            </label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => handleTestInputChange("email", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your email address to test..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={testData.subject}
              onChange={(e) => handleTestInputChange("subject", e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Test email subject..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Message Content
            </label>
            <textarea
              value={testData.content}
              onChange={(e) => handleTestInputChange("content", e.target.value)}
              className="w-full p-2 border rounded"
              rows="8"
              placeholder="Write your test message here..."
            />
          </div>

          <button
            onClick={handleTestEmail}
            disabled={sending || !testData.email}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Test Email"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailAnnouncement;

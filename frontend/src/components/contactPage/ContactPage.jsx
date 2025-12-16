import React, { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import ContactForm from "./ContactForm";
import Faq from "./Faq";
import api from "../../../utils/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((pre) => ({
      ...pre,
      [name]: value,
    }));
  };
  //   ...formData,
  //   [e.target.name]: e.target.value,
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await api.post("/contact", {
        formdata: formData,
      });

      console.log("Response:", response.data);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiPhone className="text-2xl" />,
      title: "Phone",
      details: "+1 (555) 123-4567",
      description: "Mon to Fri 9am to 6pm",
    },
    {
      icon: <FiMail className="text-2xl" />,
      title: "Email",
      details: "support@shopnow.com",
      description: "Send us your query anytime!",
    },
    {
      icon: <FiMapPin className="text-2xl" />,
      title: "Address",
      details: "123 Commerce Street",
      description: "Mumbai, MH 400001, India",
    },
    {
      icon: <FiClock className="text-2xl" />,
      title: "Working Hours",
      details: "Monday to Friday",
      description: "9:00 AM - 6:00 PM IST",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help! Get in touch with our team for any questions
              about our products or services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>

                {submitStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <FiCheckCircle className="text-green-600 mr-3 text-xl" />
                    <div>
                      <p className="text-green-800 font-semibold">
                        Message sent successfully!
                      </p>
                      <p className="text-green-700 text-sm">
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <FiAlertCircle className="text-red-600 mr-3 text-xl" />
                    <div>
                      <p className="text-red-800 font-semibold">
                        Failed to send message
                      </p>
                      <p className="text-red-700 text-sm">
                        Please try again later or contact us directly.
                      </p>
                    </div>
                  </div>
                )}

                <ContactForm
                  handleSubmit={handleSubmit}
                  formData={formData}
                  handleChange={handleChange}
                  isSubmitting={isSubmitting}
                />
              </div>
              <Faq />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#f6e9ee] rounded-lg flex items-center justify-center text-[#8F2B53]">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-gray-900 font-medium">
                          {item.details}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    {["Facebook", "Twitter", "Instagram", "LinkedIn"].map(
                      (social) => (
                        <button
                          key={social}
                          className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#f6e9ee] hover:text-[#8F2B53] transition-colors"
                        >
                          {social.charAt(0)}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="mt-8 p-4 bg-[#f6e9ee] rounded-lg">
                  <h3 className="font-semibold text-[#8F2B53] mb-2">
                    Need Immediate Help?
                  </h3>
                  <p className="text-[#8F2B53] text-sm mb-4">
                    Our live chat support is available 24/7 for urgent
                    inquiries.
                  </p>
                  <button className="w-full bg-gradient-to-r from-[#BE386E] via-[#8F2A53] to-[#68012A] text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 transition-colors">
                    Start Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're here to help! Get in touch with our team for any questions
              about our products or services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>

                {submitStatus === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <FiCheckCircle className="text-green-600 mr-3 text-xl" />
                    <div>
                      <p className="text-green-800 font-semibold">
                        Message sent successfully!
                      </p>
                      <p className="text-green-700 text-sm">
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <FiAlertCircle className="text-red-600 mr-3 text-xl" />
                    <div>
                      <p className="text-red-800 font-semibold">
                        Failed to send message
                      </p>
                      <p className="text-red-700 text-sm">
                        Please try again later or contact us directly.
                      </p>
                    </div>
                  </div>
                )}

                <ContactForm
                  handleSubmit={handleSubmit}
                  formData={formData}
                  handleChange={handleChange}
                  isSubmitting={isSubmitting}
                />
              </div>
              <Faq />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-gray-900 font-medium">
                          {item.details}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    {["Facebook", "Twitter", "Instagram", "LinkedIn"].map(
                      (social) => (
                        <button
                          key={social}
                          className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                          {social.charAt(0)}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 mb-2">
                    Need Immediate Help?
                  </h3>
                  <p className="text-indigo-700 text-sm mb-4">
                    Our live chat support is available 24/7 for urgent
                    inquiries.
                  </p>
                  <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Start Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
         
        </div>
      </div> */}
    </>
  );
}

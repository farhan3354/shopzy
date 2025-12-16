import React, { useState } from "react";
import {
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiClock,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

export default function Support() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "general", name: "General Questions" },
    { id: "orders", name: "Orders & Shipping" },
    { id: "returns", name: "Returns & Refunds" },
    { id: "payments", name: "Payments & Pricing" },
    { id: "account", name: "Account Issues" },
    { id: "technical", name: "Technical Support" },
  ];

  const faqs = {
    general: [
      {
        id: 1,
        question: "How do I create an account?",
        answer:
          'To create an account, click on the "Sign Up" button in the top right corner of our website. Fill in your details including your name, email address, and a secure password. You can also sign up using your Google or Facebook account for faster registration.',
      },
      {
        id: 2,
        question: "How can I track my order?",
        answer:
          "Once your order has been shipped, you will receive a confirmation email with a tracking number. You can use this tracking number on our website's \"Order Tracking\" page or on the carrier's website to monitor your package's journey.",
      },
      {
        id: 3,
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for most items in their original condition. Some items like perishable goods, personal care products, and digital downloads may not be eligible for return. Please check the product page for specific return eligibility.",
      },
    ],
    orders: [
      {
        id: 1,
        question: "How long does shipping take?",
        answer:
          "Standard shipping typically takes 3-5 business days within the continental US. Express shipping options are available at checkout for 1-2 business day delivery. International shipping times vary by destination but generally take 7-14 business days.",
      },
      {
        id: 2,
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by location. You can see the shipping cost for your country during checkout before completing your purchase.",
      },
      {
        id: 3,
        question: "Can I change my order after it has been placed?",
        answer:
          "We process orders quickly to ensure fast delivery. If you need to make changes, please contact us within 1 hour of placing your order. We'll do our best to accommodate your request, but we cannot guarantee changes once the order has entered the fulfillment process.",
      },
    ],
    returns: [
      {
        id: 1,
        question: "How do I return an item?",
        answer:
          'To initiate a return, log into your account and go to the "Order History" section. Select the item you wish to return and follow the prompts. You will receive a return authorization and shipping label. Pack the item securely in its original packaging and drop it off at any designated shipping location.',
      },
      {
        id: 2,
        question: "How long does it take to process a refund?",
        answer:
          "Once we receive your returned item, our team will inspect it within 2-3 business days. After approval, refunds are processed immediately but may take 5-10 business days to appear in your account depending on your payment method and financial institution.",
      },
    ],
    payments: [
      {
        id: 1,
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Amazon Pay. We also offer the option to pay in installments through services like Afterpay and Klarna for eligible orders.",
      },
      {
        id: 2,
        question: "Is my payment information secure?",
        answer:
          "Yes, we use industry-standard SSL encryption to protect your payment information. We do not store your complete payment details on our servers. All transactions are processed through PCI-compliant payment gateways to ensure the highest level of security.",
      },
    ],
    account: [
      {
        id: 1,
        question: "How do I reset my password?",
        answer:
          'Click on the "Forgot Password" link on the login page. Enter the email address associated with your account, and we\'ll send you a link to reset your password. The link will expire after 24 hours for security reasons.',
      },
      {
        id: 2,
        question: "Can I merge multiple accounts?",
        answer:
          "Yes, we can help you merge multiple accounts. Please contact our support team with the email addresses associated with each account, and we'll assist you in consolidating your order history and account information.",
      },
    ],
    technical: [
      {
        id: 1,
        question: "The website is not loading properly",
        answer:
          "Try clearing your browser cache and cookies, then restart your browser. Ensure you're using a supported browser (Chrome, Firefox, Safari, or Edge) with JavaScript enabled. If the issue persists, please contact our technical support team with details about your device and browser.",
      },
      {
        id: 2,
        question: "I'm having trouble checking out",
        answer:
          "This could be due to several reasons: your cart may contain items that are out of stock, there might be an issue with your payment method, or your browser may need updating. Try using a different browser or device. If problems continue, contact our support team for assistance.",
      },
    ],
  };

  //   const [contactForm, setContactForm] = useState({
  //     name: "",
  //     email: "",
  //     subject: "",
  //     message: "",
  //   });

  //   const handleInputChange = (e) => {
  //     const { name, value } = e.target;
  //     setContactForm((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   };

  //   const handleSubmit = (e) => {
  //     e.preventDefault();
  //     alert("Thank you for your message. We will get back to you soon!");
  //     setContactForm({ name: "", email: "", subject: "", message: "" });
  //   };

  const filteredFaqs = Object.entries(faqs).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    return acc;
  }, {});

  const hasSearchResults = Object.values(filteredFaqs).some(
    (items) => items.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-full mb-4">
            <FiHelpCircle className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Support
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            How can we help you today? Find answers to common questions or
            contact our support team.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search for help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              <FiMessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Live Chat
            </h3>
            <p className="text-gray-600 mb-4">
              Chat with our support agents in real-time
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Start Chat
            </button>
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
              <FiClock className="mr-1" /> Available 24/7
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
              <FiPhone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">
              Speak directly with our support team
            </p>
            <a
              href="tel:+18001234567"
              className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              +1 (800) 123-4567
            </a>
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
              <FiClock className="mr-1" /> Mon-Fri, 8am-8pm EST
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
              <FiMail className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-4">
              Send us a message and we'll respond quickly
            </p>
            <a
              href="mailto:support@example.com"
              className="block w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              support@example.com
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Typically responds within 2 hours
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-12">
          <div className="border-b border-gray-200">
            <div className="px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 mt-1">
                Find answers to common questions about our products and services
              </p>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto -mb-px">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeCategory === category.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {searchTerm && !hasSearchResults ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No results found for "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(searchTerm
                  ? filteredFaqs[activeCategory] || []
                  : faqs[activeCategory]
                ).map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-900 bg-white hover:bg-gray-50"
                      onClick={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                    >
                      <span>{faq.question}</span>
                      {expandedFaq === faq.id ? (
                        <FiChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-600 mt-1">
              Can't find what you're looking for? Send us a message
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Message
              </button>
            </div>
          </form>
        </div> */}
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { FiEdit2, FiTrash2 } from "react-icons/fi";
// import { useSelector } from "react-redux";
// import Swal from "sweetalert2";
// import useFetchData from "../../hooks/useFetchData";
// import { FAQ_ROUTES } from "../../../utils/apiRoute";

// export default function AdminFaqPage() {
//   const [faqs, setFaqs] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [editId, setEditId] = useState(null);

//   const token = useSelector((state) => state.auth.token);
//   const { fetchData, postData, updateData, deleteData, loading } =
//     useFetchData(token);

//   const fetchFaqs = async () => {
//     await fetchData(FAQ_ROUTES.all, (data) => {
//       if (data.success) {
//         setFaqs(data.faqs || []);
//       }
//     });
//   };

//   useEffect(() => {
//     fetchFaqs();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!question.trim() || !answer.trim()) {
//       Swal.fire("Error", "All fields are required!", "error");
//       return;
//     }

//     try {
//       if (editId) {
//         await updateData(
//           FAQ_ROUTES.update(editId),
//           { question, answer },
//           "FAQ updated successfully!"
//         );
//       } else {
//         await postData(
//           FAQ_ROUTES.create,
//           { question, answer },
//           "FAQ added successfully!"
//         );
//       }
//       setQuestion("");
//       setAnswer("");
//       setEditId(null);
//       fetchFaqs();
//     } catch (error) {
//       // Error is handled by the hook
//     }
//   };

//   const handleDelete = async (id) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This FAQ will be permanently deleted!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await deleteData(FAQ_ROUTES.delete(id), "FAQ deleted successfully!");
//           fetchFaqs();
//         } catch (error) {
//           // Error is handled by the hook
//         }
//       }
//     });
//   };

//   const handleEdit = (faq) => {
//     setEditId(faq._id);
//     setQuestion(faq.question);
//     setAnswer(faq.answer);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const cancelEdit = () => {
//     setEditId(null);
//     setQuestion("");
//     setAnswer("");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
//       <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-4 sm:p-6">
//         <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 text-center">
//           Admin FAQ Management
//         </h1>

//         <form
//           onSubmit={handleSubmit}
//           className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6"
//         >
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Question
//             </label>
//             <input
//               type="text"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="Enter FAQ question"
//               className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Answer
//             </label>
//             <textarea
//               value={answer}
//               onChange={(e) => setAnswer(e.target.value)}
//               placeholder="Enter FAQ answer"
//               rows="4"
//               className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors resize-vertical"
//             ></textarea>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-teal-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? "Saving..." : editId ? "Update FAQ" : "Add FAQ"}
//             </button>

//             {editId && (
//               <button
//                 type="button"
//                 onClick={cancelEdit}
//                 className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>

//         <div className="border-t border-gray-200 pt-6">
//           <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
//             Existing FAQs ({faqs.length})
//           </h2>

//           {faqs.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="text-gray-400 text-4xl mb-3">?</div>
//               <p className="text-gray-500 text-sm">
//                 No FAQs found. Add your first FAQ above.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {faqs.map((faq) => (
//                 <div
//                   key={faq._id}
//                   className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
//                 >
//                   <div className="flex justify-between items-start gap-4">
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2">
//                         {faq.question}
//                       </h3>
//                       <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
//                         {faq.answer}
//                       </p>
//                     </div>
//                     <div className="flex gap-2 flex-shrink-0">
//                       <button
//                         onClick={() => handleEdit(faq)}
//                         className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
//                         title="Edit FAQ"
//                       >
//                         <FiEdit2 size={16} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(faq._id)}
//                         className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                         title="Delete FAQ"
//                       >
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import { FAQ_ROUTES } from "../../../utils/apiRoute";
import { Editor } from "@tinymce/tinymce-react";

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState(null);
  const editorRef = useRef(null);

  const token = useSelector((state) => state.auth.token);
  const { fetchData, postData, updateData, deleteData, loading } =
    useFetchData(token);

  const fetchFaqs = async () => {
    await fetchData(FAQ_ROUTES.all, (data) => {
      if (data.success) {
        setFaqs(data.faqs || []);
      }
    });
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if answer has actual content (not just empty HTML)
    const hasContent =
      answer && answer.replace(/<[^>]*>/g, "").trim().length > 0;

    if (!question.trim() || !hasContent) {
      Swal.fire("Error", "Question and Answer are required!", "error");
      return;
    }

    try {
      if (editId) {
        await updateData(
          FAQ_ROUTES.update(editId),
          { question, answer },
          "FAQ updated successfully!"
        );
      } else {
        await postData(
          FAQ_ROUTES.create,
          { question, answer },
          "FAQ added successfully!"
        );
      }
      setQuestion("");
      setAnswer("");
      setEditId(null);
      fetchFaqs();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This FAQ will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteData(FAQ_ROUTES.delete(id), "FAQ deleted successfully!");
          fetchFaqs();
        } catch (error) {
          // Error is handled by the hook
        }
      }
    });
  };

  const handleEdit = (faq) => {
    setEditId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setQuestion("");
    setAnswer("");
  };

  // TinyMCE configuration with enhanced styling options
  const editorConfig = {
    height: 300,
    menubar: true,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "code",
      "help",
      "wordcount",
    ],
    toolbar:
      "undo redo | blocks | bold italic underline strikethrough | " +
      "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | link image media | " +
      "fontsizeselect fontselect | removeformat | code | help",
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #374151;
      }
      h1, h2, h3, h4, h5, h6 { 
        color: #111827; 
        margin-top: 1em;
        margin-bottom: 0.5em;
      }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.25em; }
      p { margin-bottom: 1em; }
      ul, ol { padding-left: 2em; }
      blockquote { 
        border-left: 4px solid #0ea5e9; 
        background-color: #f0f9ff;
        padding: 1em 1.5em; 
        margin: 1em 0;
        font-style: italic;
        color: #1e40af;
        border-radius: 0 0.5em 0.5em 0;
      }
      code {
        background-color: #f3f4f6;
        padding: 0.1em 0.3em;
        border-radius: 0.25em;
        font-family: 'Courier New', monospace;
        color: #dc2626;
      }
      pre {
        background-color: #1f2937;
        color: #f9fafb;
        padding: 1em;
        border-radius: 0.375em;
        overflow-x: auto;
        margin: 1em 0;
      }
      a { color: #0ea5e9; }
      a:hover { color: #0284c7; }
      table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
      table, th, td { border: 1px solid #e5e7eb; }
      th { background-color: #f8fafc; font-weight: 600; }
      th, td { padding: 0.75em; text-align: left; }
      tr:nth-child(even) { background-color: #f9fafb; }
      
      /* Custom classes for admin styling */
      .text-red { color: #dc2626; }
      .text-blue { color: #2563eb; }
      .text-green { color: #059669; }
      .text-yellow { color: #d97706; }
      .text-purple { color: #7c3aed; }
      .text-pink { color: #db2777; }
      .text-indigo { color: #4f46e5; }
      .text-teal { color: #0d9488; }
      .text-orange { color: #ea580c; }
      .text-gray { color: #6b7280; }
      
      .bg-red { background-color: #fef2f2; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-blue { background-color: #eff6ff; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-green { background-color: #f0fdf4; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-yellow { background-color: #fefce8; padding: 0.25em 0.5em; border-radius: 0.25em; }
      .bg-purple { background-color: #faf5ff; padding: 0.25em 0.5em; border-radius: 0.25em; }
      
      .text-xs { font-size: 0.75em; }
      .text-sm { font-size: 0.875em; }
      .text-base { font-size: 1em; }
      .text-lg { font-size: 1.125em; }
      .text-xl { font-size: 1.25em; }
      .text-2xl { font-size: 1.5em; }
      
      .font-light { font-weight: 300; }
      .font-normal { font-weight: 400; }
      .font-medium { font-weight: 500; }
      .font-semibold { font-weight: 600; }
      .font-bold { font-weight: 700; }
      
      .text-left { text-align: left; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-justify { text-align: justify; }
    `,
    branding: false,
    promotion: false,
    paste_data_images: false,
    images_upload_handler: null,
    automatic_uploads: false,
    formats: {
      alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-left' },
      aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-center' },
      alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-right' },
      alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-justify' },
    },
    style_formats: [
      { title: 'Heading 1', format: 'h1' },
      { title: 'Heading 2', format: 'h2' },
      { title: 'Heading 3', format: 'h3' },
      { title: 'Heading 4', format: 'h4' },
      { title: 'Heading 5', format: 'h5' },
      { title: 'Heading 6', format: 'h6' },
      { title: 'Paragraph', format: 'p' },
      { title: 'Blockquote', format: 'blockquote' },
      { title: 'Pre', format: 'pre' },
      { 
        title: 'Text Colors', 
        items: [
          { title: 'Red', inline: 'span', classes: 'text-red' },
          { title: 'Blue', inline: 'span', classes: 'text-blue' },
          { title: 'Green', inline: 'span', classes: 'text-green' },
          { title: 'Yellow', inline: 'span', classes: 'text-yellow' },
          { title: 'Purple', inline: 'span', classes: 'text-purple' },
          { title: 'Pink', inline: 'span', classes: 'text-pink' },
          { title: 'Indigo', inline: 'span', classes: 'text-indigo' },
          { title: 'Teal', inline: 'span', classes: 'text-teal' },
          { title: 'Orange', inline: 'span', classes: 'text-orange' },
          { title: 'Gray', inline: 'span', classes: 'text-gray' }
        ]
      },
      { 
        title: 'Background Colors', 
        items: [
          { title: 'Red Background', inline: 'span', classes: 'bg-red' },
          { title: 'Blue Background', inline: 'span', classes: 'bg-blue' },
          { title: 'Green Background', inline: 'span', classes: 'bg-green' },
          { title: 'Yellow Background', inline: 'span', classes: 'bg-yellow' },
          { title: 'Purple Background', inline: 'span', classes: 'bg-purple' }
        ]
      },
      { 
        title: 'Font Sizes', 
        items: [
          { title: 'Extra Small', inline: 'span', classes: 'text-xs' },
          { title: 'Small', inline: 'span', classes: 'text-sm' },
          { title: 'Base', inline: 'span', classes: 'text-base' },
          { title: 'Large', inline: 'span', classes: 'text-lg' },
          { title: 'Extra Large', inline: 'span', classes: 'text-xl' },
          { title: '2X Large', inline: 'span', classes: 'text-2xl' }
        ]
      },
      { 
        title: 'Font Weights', 
        items: [
          { title: 'Light', inline: 'span', classes: 'font-light' },
          { title: 'Normal', inline: 'span', classes: 'font-normal' },
          { title: 'Medium', inline: 'span', classes: 'font-medium' },
          { title: 'Semibold', inline: 'span', classes: 'font-semibold' },
          { title: 'Bold', inline: 'span', classes: 'font-bold' }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 text-center">
          Admin FAQ Management
        </h1>

        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter FAQ question"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer *
            </label>

            {/* TinyMCE Rich Text Editor */}
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
              <Editor
                onInit={(evt, editor) => (editorRef.current = editor)}
                value={answer}
                onEditorChange={(newValue) => setAnswer(newValue)}
                init={editorConfig}
                apiKey={"5vdp2934fu4e3s9ppww5is091de5hxrjv2ju7lh5unb8ycvd"}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
              <span>
                💡 <strong>Formatting Tips:</strong>
              </span>
              <span>• Use headings for structure</span>
              <span>• Create lists for steps</span>
              <span>• Add links for references</span>
              <span>• Use tables for data</span>
              <span>• Apply colors and backgrounds from format menu</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-teal-700"
            >
              {loading ? "Saving..." : editId ? "Update FAQ" : "Add FAQ"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Existing FAQs ({faqs.length})
          </h2>

          {faqs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-3">?</div>
              <p className="text-gray-500 text-sm">
                No FAQs found. Add your first FAQ above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div
                  key={faq._id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-lg sm:text-xl mb-3 pb-2 border-b border-gray-200">
                        {faq.question}
                      </h3>

                      {/* Display formatted HTML content */}
                      <div
                        className="text-gray-700 leading-relaxed faq-content"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-teal-200"
                        title="Edit FAQ"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                        title="Delete FAQ"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useState, useRef } from "react";
// import { FiEdit2, FiTrash2 } from "react-icons/fi";
// import { useSelector } from "react-redux";
// import Swal from "sweetalert2";
// import useFetchData from "../../hooks/useFetchData";
// import { FAQ_ROUTES } from "../../../utils/apiRoute";

// // TinyMCE Editor
// import { Editor } from "@tinymce/tinymce-react";

// export default function AdminFaqPage() {
//   const [faqs, setFaqs] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [editId, setEditId] = useState(null);
//   const editorRef = useRef(null);

//   const token = useSelector((state) => state.auth.token);
//   const { fetchData, postData, updateData, deleteData, loading } =
//     useFetchData(token);

//   const fetchFaqs = async () => {
//     await fetchData(FAQ_ROUTES.all, (data) => {
//       if (data.success) {
//         setFaqs(data.faqs || []);
//       }
//     });
//   };

//   useEffect(() => {
//     fetchFaqs();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Check if answer has actual content (not just empty HTML)
//     const hasContent =
//       answer && answer.replace(/<[^>]*>/g, "").trim().length > 0;

//     if (!question.trim() || !hasContent) {
//       Swal.fire("Error", "Question and Answer are required!", "error");
//       return;
//     }

//     try {
//       if (editId) {
//         await updateData(
//           FAQ_ROUTES.update(editId),
//           { question, answer },
//           "FAQ updated successfully!"
//         );
//       } else {
//         await postData(
//           FAQ_ROUTES.create,
//           { question, answer },
//           "FAQ added successfully!"
//         );
//       }
//       setQuestion("");
//       setAnswer("");
//       setEditId(null);
//       fetchFaqs();
//     } catch (error) {
//       // Error is handled by the hook
//     }
//   };

//   const handleDelete = async (id) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This FAQ will be permanently deleted!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await deleteData(FAQ_ROUTES.delete(id), "FAQ deleted successfully!");
//           fetchFaqs();
//         } catch (error) {
//           // Error is handled by the hook
//         }
//       }
//     });
//   };

//   const handleEdit = (faq) => {
//     setEditId(faq._id);
//     setQuestion(faq.question);
//     setAnswer(faq.answer);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const cancelEdit = () => {
//     setEditId(null);
//     setQuestion("");
//     setAnswer("");
//   };

//   // TinyMCE configuration
//   const editorConfig = {
//     height: 300,
//     menubar: true,
//     plugins: [
//       "advlist",
//       "autolink",
//       "lists",
//       "link",
//       "image",
//       "charmap",
//       "preview",
//       "anchor",
//       "searchreplace",
//       "visualblocks",
//       "code",
//       "fullscreen",
//       "insertdatetime",
//       "media",
//       "table",
//       "code",
//       "help",
//       "wordcount",
//     ],
//     toolbar:
//       "undo redo | blocks | bold italic underline strikethrough | " +
//       "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
//       "bullist numlist outdent indent | link image media | " +
//       "removeformat | code | help",
//     content_style: `
//       body { 
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
//         font-size: 14px; 
//         line-height: 1.6;
//         color: #374151;
//       }
//       h1, h2, h3, h4, h5, h6 { 
//         color: #111827; 
//         margin-top: 1em;
//         margin-bottom: 0.5em;
//       }
//       h1 { font-size: 2em; }
//       h2 { font-size: 1.5em; }
//       h3 { font-size: 1.25em; }
//       p { margin-bottom: 1em; }
//       ul, ol { padding-left: 2em; }
//       blockquote { 
//         border-left: 4px solid #e5e7eb; 
//         padding-left: 1em; 
//         margin: 1em 0;
//         font-style: italic;
//         color: #6b7280;
//       }
//       code {
//         background-color: #f3f4f6;
//         padding: 0.1em 0.3em;
//         border-radius: 0.25em;
//         font-family: 'Courier New', monospace;
//       }
//       pre {
//         background-color: #f8f9fa;
//         padding: 1em;
//         border-radius: 0.375em;
//         overflow-x: auto;
//         margin: 1em 0;
//       }
//       a { color: #0ea5e9; }
//       a:hover { color: #0284c7; }
//       table { border-collapse: collapse; width: 100%; }
//       table, th, td { border: 1px solid #d1d5db; }
//       th, td { padding: 0.5em; text-align: left; }
//     `,
//     branding: false,
//     promotion: false,
//     paste_data_images: false,
//     images_upload_handler: null,
//     automatic_uploads: false,
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
//       <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-lg p-4 sm:p-6">
//         <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 text-center">
//           Admin FAQ Management
//         </h1>

//         <form
//           onSubmit={handleSubmit}
//           className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6"
//         >
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Question *
//             </label>
//             <input
//               type="text"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="Enter FAQ question"
//               className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Answer *
//             </label>

//             {/* TinyMCE Rich Text Editor */}
//             <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
//               <Editor
//                 onInit={(evt, editor) => (editorRef.current = editor)}
//                 value={answer}
//                 onEditorChange={(newValue) => setAnswer(newValue)}
//                 init={editorConfig}
//                 apiKey="r57z7qpiukxw2dgybheabhvqtuyla0n0io0luqgm8zta35gh" // Get free API key from TinyMCE cloud
//               />
//             </div>

//             <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
//               <span>
//                 💡 <strong>Formatting Tips:</strong>
//               </span>
//               <span>• Use headings for structure</span>
//               <span>• Create lists for steps</span>
//               <span>• Add links for references</span>
//               <span>• Use tables for data</span>
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-teal-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? "Saving..." : editId ? "Update FAQ" : "Add FAQ"}
//             </button>

//             {editId && (
//               <button
//                 type="button"
//                 onClick={cancelEdit}
//                 className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>

//         <div className="border-t border-gray-200 pt-6">
//           <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
//             Existing FAQs ({faqs.length})
//           </h2>

//           {faqs.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="text-gray-400 text-4xl mb-3">?</div>
//               <p className="text-gray-500 text-sm">
//                 No FAQs found. Add your first FAQ above.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {faqs.map((faq) => (
//                 <div
//                   key={faq._id}
//                   className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
//                 >
//                   <div className="flex justify-between items-start gap-4">
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-semibold text-gray-800 text-lg sm:text-xl mb-3 pb-2 border-b border-gray-200">
//                         {faq.question}
//                       </h3>

//                       {/* Display formatted HTML content */}
//                       <div
//                         className="text-gray-700 leading-relaxed faq-content"
//                         dangerouslySetInnerHTML={{ __html: faq.answer }}
//                       />
//                     </div>
//                     <div className="flex gap-2 flex-shrink-0">
//                       <button
//                         onClick={() => handleEdit(faq)}
//                         className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
//                         title="Edit FAQ"
//                       >
//                         <FiEdit2 size={18} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(faq._id)}
//                         className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                         title="Delete FAQ"
//                       >
//                         <FiTrash2 size={18} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Custom CSS for FAQ content display */}
//       <style jsx>{`
//         .faq-content {
//           font-size: 15px;
//           line-height: 1.7;
//         }

//         .faq-content h1 {
//           font-size: 1.5em;
//           font-weight: 700;
//           color: #111827;
//           margin: 1em 0 0.5em 0;
//           border-bottom: 2px solid #e5e7eb;
//           padding-bottom: 0.3em;
//         }

//         .faq-content h2 {
//           font-size: 1.3em;
//           font-weight: 600;
//           color: #111827;
//           margin: 1em 0 0.5em 0;
//         }

//         .faq-content h3 {
//           font-size: 1.1em;
//           font-weight: 600;
//           color: #111827;
//           margin: 1em 0 0.5em 0;
//         }

//         .faq-content p {
//           margin-bottom: 1em;
//         }

//         .faq-content ul,
//         .faq-content ol {
//           margin: 1em 0;
//           padding-left: 2em;
//         }

//         .faq-content li {
//           margin-bottom: 0.5em;
//         }

//         .faq-content blockquote {
//           border-left: 4px solid #0ea5e9;
//           background-color: #f0f9ff;
//           padding: 1em 1.5em;
//           margin: 1.5em 0;
//           border-radius: 0 0.5em 0.5em 0;
//         }

//         .faq-content code {
//           background-color: #f3f4f6;
//           padding: 0.2em 0.4em;
//           border-radius: 0.25em;
//           font-family: "Courier New", monospace;
//           font-size: 0.9em;
//           color: #dc2626;
//         }

//         .faq-content pre {
//           background-color: #1f2937;
//           color: #f9fafb;
//           padding: 1em;
//           border-radius: 0.5em;
//           overflow-x: auto;
//           margin: 1.5em 0;
//         }

//         .faq-content pre code {
//           background: none;
//           color: inherit;
//           padding: 0;
//         }

//         .faq-content a {
//           color: #0ea5e9;
//           text-decoration: underline;
//           font-weight: 500;
//         }

//         .faq-content a:hover {
//           color: #0284c7;
//         }

//         .faq-content table {
//           width: 100%;
//           border-collapse: collapse;
//           margin: 1.5em 0;
//           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//         }

//         .faq-content th {
//           background-color: #f8fafc;
//           font-weight: 600;
//           text-align: left;
//         }

//         .faq-content th,
//         .faq-content td {
//           border: 1px solid #e5e7eb;
//           padding: 0.75em;
//         }

//         .faq-content tr:nth-child(even) {
//           background-color: #f9fafb;
//         }

//         .faq-content img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 0.5em;
//           margin: 1em 0;
//         }
//       `}</style>
//     </div>
//   );
// }

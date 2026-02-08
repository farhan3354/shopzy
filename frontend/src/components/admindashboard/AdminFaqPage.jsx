import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import useFetchData from "../../hooks/useFetchData";
import { FAQ_ROUTES } from "../../../utils/apiRoute";

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

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
    if (!question.trim() || !answer.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Both question and answer are required!",
      });
      return;
    }

    try {
      if (editId) {
        await updateData(
          FAQ_ROUTES.update(editId),
          { question, answer },
          "FAQ updated successfully!"
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "FAQ has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await postData(
          FAQ_ROUTES.create,
          { question, answer },
          "FAQ added successfully!"
        );
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "New FAQ has been added successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      resetForm();
      fetchFaqs();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteData(FAQ_ROUTES.delete(id), "FAQ deleted successfully!");
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "FAQ has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
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
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditId(null);
    setQuestion("");
    setAnswer("");
    setIsFormVisible(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
            <p className="text-gray-500 mt-1">Manage frequently asked questions</p>
          </div>
          <button
            onClick={() => {
              if (isFormVisible && !editId) {
                setIsFormVisible(false);
              } else {
                resetForm();
                setIsFormVisible(true);
              }
            }}
            className={`mt-4 sm:mt-0 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              isFormVisible && !editId
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-lg"
            }`}
          >
            {isFormVisible && !editId ? (
              <>Cancel Adding</>
            ) : (
              <>
                <span className="text-xl">+</span> Add New FAQ
              </>
            )}
          </button>
        </div>

        {/* Form Section */}
        {isFormVisible && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-down">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-800">
                {editId ? "Edit FAQ" : "Create New FAQ"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do I track my order?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide a detailed answer..."
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    editId ? "Update FAQ" : "Publish FAQ"
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Section */}
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ?
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No FAQs yet</h3>
              <p className="text-gray-500 mt-1">Get started by creating your first frequently asked question.</p>
            </div>
          ) : (
            faqs.map((faq) => (
              <div
                key={faq._id}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="space-y-3 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                       <span className="text-blue-500">Q.</span> {faq.question}
                    </h3>
                    <div className="text-gray-600 leading-relaxed pl-6 border-l-2 border-gray-100">
                      {faq.answer}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

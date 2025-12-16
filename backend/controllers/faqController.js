import Faq from "../models/Faq.js";

export const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }
    const newFaq = await Faq.create({ question, answer });

    return res.status(201).json({ success: true, faq: newFaq });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all FAQs
export const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update FAQ
export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Faq.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated)
      return res.status(404).json({ success: false, message: "FAQ not found" });

    res.status(200).json({ success: true, faq: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete FAQ
export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Faq.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "FAQ not found" });

    res
      .status(200)
      .json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

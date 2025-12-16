import contactModel from "../models/contactModel.js";

export const contactform = async (req, res) => {
  try {
    const { formdata } = req.body;
    if (
      !formdata ||
      !formdata.name?.trim() ||
      !formdata.email?.trim() ||
      !formdata.message?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All the fields are required",
      });
    }

    const form = new contactModel({
      name: formdata.name.trim(),
      email: formdata.email.trim(),
      subject: formdata.subject || "other",
      message: formdata.message.trim(),
    });

    await form.save();

    return res.status(201).json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const getcontactMessage = async (req, res) => {
  try {
    const messages = await contactModel.find();
    if (!messages) {
      return res.status(404).json({
        success: false,
        message: "No data or messages in the database",
      });
    }
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(404)
        .json({ success: false, message: "Id is required" });
    }
    const messageDelete = await contactModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "message deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

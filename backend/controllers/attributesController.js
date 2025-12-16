import Attribute from "../models/attributeModel.js";

export const createAttribute = async (req, res) => {
  try {
    const { name, values, subcategory, Fieldtype } = req.body;

    if (!name || !subcategory || !Fieldtype) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Subcategory are required" });
    }

    const attribute = await Attribute.create({
      name,
      values,
      subcategory,
      Fieldtype,
    });

    return res.status(201).json({ success: true, data: attribute });
  } catch (error) {
    console.error("Error creating attribute:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find().populate("subcategory");
    if (!attributes) {
      return res
        .status(404)
        .json({ success: false, message: "No data in the database" });
    }
    return res.json({ success: true, data: attributes });
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAttribute = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(404)
        .json({ success: false, message: "Id is required" });
    }
    const deleteAttr = await Attribute.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Attribute delete successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

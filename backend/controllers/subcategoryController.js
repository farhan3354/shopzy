import Subcategory from "../models/subcategory.js";
import slugify from "slugify";

export const createSubcategory = async (req, res) => {
  try {
    const { name, parentCategory } = req.body;

    if (!name || !parentCategory) {
      return res
        .status(400)
        .json({ message: "Name and parent category are required" });
    }

    const slug = slugify(name, { lower: true });

    const existing = await Subcategory.findOne({ slug });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Subcategory with this name already exists" });
    }

    const subcategory = await Subcategory.create({
      name,
      slug,
      parentCategory,
    });

    res.status(201).json(subcategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const subcateg = await Subcategory.find().populate(
      "parentCategory",
      "name slug"
    );
    if (!subcateg) {
      return res
        .status(404)
        .json({ success: false, message: "Data is not found in the database" });
    }
    return res.status(200).json({ success: false, subcateg });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subcateg = await Subcategory.findById(id);
    if (!subcateg) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    return res.status(200).json({ subcateg });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    console.log("🔍 Fetching subcategories for category ID:", categoryId);

    const subcategories = await Subcategory.find({
      parentCategory: categoryId,
    })
      .populate("parentCategory", "name slug")
      .sort({ name: 1 });

    console.log(`✅ Found ${subcategories.length} subcategories`);

    res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      subcateg: subcategories,
    });
  } catch (error) {
    console.error("❌ Error fetching subcategories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Id is required" });
    }

    const { name, parentCategory, attributes } = req.body;
    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      { name, parentCategory, attributes },
      { new: true }
    );
    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });
    res.json(subcategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Id is required" });
    }
    const subcategory = await Subcategory.findByIdAndDelete(id);
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    return res.json({ message: "Subcategory deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

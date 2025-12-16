// controllers/pageController.js
import Page from "../models/Page.js";
import slugify from "slugify";
import sanitizeHtml from "sanitize-html";

export const createPage = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Basic HTML sanitization
    const cleanHtml = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt", "width", "height"],
      },
    });

    const slugBase = slugify(title, {
      lower: true,
      strict: true,
    });

    let slug = slugBase;
    let counter = 1;

    // Check for existing slugs
    while (await Page.findOne({ slug })) {
      slug = `${slugBase}-${counter++}`;
    }

    const page = await Page.create({
      title: title.trim(),
      slug,
      content: cleanHtml,
    });

    return res.status(201).json({
      success: true,
      message: "Page created successfully",
      page,
    });
  } catch (err) {
    console.error("Create page error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const listPages = async (req, res) => {
  try {
    const pages = await Page.find()
      .sort({ createdAt: -1 })
      .select("title slug createdAt updatedAt isActive");

    return res.status(200).json({
      success: true,
      pages,
      count: pages.length,
    });
  } catch (err) {
    console.error("List pages error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      page,
    });
  } catch (err) {
    console.error("Get page error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, isActive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Basic HTML sanitization
    const cleanHtml = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt", "width", "height"],
      },
    });

    // Generate new slug if title changed
    let newSlug = slug;
    if (title) {
      const existingPage = await Page.findOne({ slug });
      if (existingPage && existingPage.title !== title) {
        const slugBase = slugify(title, {
          lower: true,
          strict: true,
        });

        newSlug = slugBase;
        let counter = 1;
        while (
          await Page.findOne({ slug: newSlug, _id: { $ne: existingPage._id } })
        ) {
          newSlug = `${slugBase}-${counter++}`;
        }
      }
    }

    const page = await Page.findOneAndUpdate(
      { slug },
      {
        title: title.trim(),
        slug: newSlug,
        content: cleanHtml,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      page,
    });
  } catch (err) {
    console.error("Update page error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const deletePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOneAndDelete({ slug });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (err) {
    console.error("Delete page error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

import Wishlist from "../models/wishlistModel.js";
import Product from "../models/product.js";


export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Populate product with all necessary fields
    const product = await Product.findById(productId)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate({
        path: "attributes.attribute",
        model: "Attribute",
        select: "name values Fieldtype",
      });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const wishlistItem = await Wishlist.findOneAndUpdate(
      { userId, productId },
      { $setOnInsert: { userId, productId } },
      { new: true, upsert: true }
    ).populate({
      path: "productId",
      populate: [
        { path: "category", select: "name slug" },
        { path: "subcategory", select: "name slug" },
        {
          path: "attributes.attribute",
          model: "Attribute",
          select: "name values Fieldtype",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlistItem,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const deletedItem = await Wishlist.findOneAndDelete({
      userId,
      productId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.find({ userId })
      .populate({
        path: "productId",
        select:
          "name slug price stock description images brand status attributes",
        populate: [
          {
            path: "category",
            select: "name slug description status",
            model: "Category",
          },
          {
            path: "subcategory",
            select: "name slug parentCategory",
            model: "Subcategory",
            populate: {
              path: "parentCategory",
              select: "name slug",
              model: "Category",
            },
          },
          {
            path: "attributes.attribute",
            model: "Attribute",
            select: "name values Fieldtype subcategory",
          },
        ],
      })
      .sort({ addedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist: wishlist || [],
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// export const getWishlist = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const wish = await Wishlist.find({ userId }).populate("productId");
//     if (!wish && wish === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No data in the database" });
//     }
//     return res.status(200).json({
//       success: true,
//       wish,
//     });
//   } catch (error) {
//     console.error("Get wishlist error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

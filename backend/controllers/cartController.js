import AuthModel from "../models/authModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/product.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { productId, quantity, selectedAttributes } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.status !== "active") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found or inactive" });
    }

    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    for (const [attrName, attrValue] of Object.entries(selectedAttributes)) {
      const exists = product.attributes.some(
        (a) => a.name === attrName && a.value.includes(attrValue)
      );
      if (!exists) {
        return res.status(400).json({
          success: false,
          message: `Invalid selection: ${attrName} - ${attrValue}`,
        });
      }
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.selectedAttributes) ===
          JSON.stringify(selectedAttributes)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        selectedAttributes,
        // priceAtTime: product.price,
      });
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error("❌ Error in addToCart:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCartCh = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products in the cart" });
    }

    return res.json({ success: true, cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user to get wallet balance
    const user = await AuthModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No products in the cart" 
      });
    }

    // Calculate cart total
    let cartTotal = 0;
    cart.items.forEach(item => {
      if (item.productId && item.productId.price) {
        cartTotal += item.productId.price * item.quantity;
      }
    });

    // Calculate wallet usage
    const walletBalance = user.walletbalance;
    const walletUsed = Math.min(walletBalance, cartTotal);
    const amountToPay = Math.max(0, cartTotal - walletBalance);

    return res.json({ 
      success: true, 
      cart,
      walletBalance: walletBalance,
      cartTotal: cartTotal,
      amountToPay: amountToPay,
      walletUsed: walletUsed
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const product = await Product.findById(cartItem.productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    cartItem.quantity = quantity;
    await cart.save();

    await cart.populate("items.productId");

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    await cart.populate("items.productId");

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("❌ Error removing cart item:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateCartAttributes = async (req, res) => {
  try {
    const { itemId, selectedAttributes } = req.body;
    const userId = req.user.id;

    console.log("Updating attributes for item:", itemId);
    console.log("New attributes:", selectedAttributes);

    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.selectedAttributes = new Map(Object.entries(selectedAttributes));
    await cart.save();

    const updatedCart = await Cart.findOne({ userId: userId }).populate(
      "items.productId"
    );

    return res.json({
      success: true,
      message: "Attributes updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating attributes:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating attributes",
    });
  }
};

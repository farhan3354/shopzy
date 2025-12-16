import Cart from "../models/cartModel.js";

export const lockCartForCheckout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId =
      req.headers["x-checkout-session"] ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (cart.isLocked && cart.lockSessionId !== sessionId) {
      const lockAge = Date.now() - new Date(cart.lockedAt).getTime();
      const lockTimeout = 15 * 60 * 1000;

      if (lockAge > lockTimeout) {
        console.log(`🔄 Auto-unlocking stale cart lock for user ${userId}`);
        cart.isLocked = false;
        cart.lockedAt = null;
        cart.lockSessionId = null;
        await cart.save();
      } else {
        return res.status(423).json({
          success: false,
          message:
            "Cart is currently being used in another checkout session. Please wait or refresh the page.",
          code: "CART_LOCKED",
        });
      }
    }

    cart.isLocked = true;
    cart.lockedAt = new Date();
    cart.lockSessionId = sessionId;
    cart.lastActivity = new Date();
    await cart.save();

    req.cartSessionId = sessionId;
    next();
  } catch (error) {
    console.error("Cart locking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to lock cart",
    });
  }
};

export const unlockCart = async (userId, sessionId = null) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (cart && cart.isLocked) {
      if (!sessionId || cart.lockSessionId === sessionId) {
        cart.isLocked = false;
        cart.lockedAt = null;
        cart.lockSessionId = null;
        await cart.save();
        console.log(`✅ Cart unlocked for user ${userId}`);
      }
    }
  } catch (error) {
    console.error("Cart unlocking error:", error);
  }
};

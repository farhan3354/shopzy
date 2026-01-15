import Order from "../models/order.js";
import Product from "../models/product.js";

export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const vendorProducts = await Product.find({ userId: vendorId }).select("_id");
    const productIds = vendorProducts.map(p => p._id.toString());

    const orders = await Order.find({ "items.productId": { $in: productIds } })
      .populate("userId", "name email") 
      .populate("items.productId", "name userId images"); 

    const filteredOrders = orders.map(order => {
      const vendorItems = order.items.filter(item =>
        productIds.includes(item.productId._id.toString())
      );

      // Calculate total for only vendor's items
      const vendorTotal = vendorItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        shippingAddress: order.shippingAddress,
        items: vendorItems,
        totalAmount: vendorTotal,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      };
    });

    return res.status(200).json({ success: true, data: filteredOrders });
  } catch (error) {
    console.error("🔥 Error fetching vendor orders:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("items.productId", "name images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns the order, is admin, or is a vendor who has products in this order
    const isVendorOfOrder = order.items.some(item => 
      item.productId && item.productId.userId && item.productId.userId.toString() === req.user.id
    );

    if (order.userId._id.toString() !== req.user.id && !req.user.role === 'admin' && !isVendorOfOrder) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, shippingCarrier } = req.body;
    const { id } = req.params;
    const order = await Order.findById(id).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization check
    const isVendorOfOrder = order.items.some(item => 
      item.productId && item.productId.userId && item.productId.userId.toString() === req.user.id
    );

    if (req.user.role !== 'admin' && !isVendorOfOrder) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to update this order"
        });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }
    order.orderStatus = orderStatus;
    if (orderStatus === "shipped" && trackingNumber) {
      order.trackingInfo = {
        trackingNumber,
        carrier: shippingCarrier || "Standard Shipping",
        shippedAt: new Date(),
      };
    }

    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    return res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("items.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization check
    const isVendorOfOrder = order.items.some(item => 
        item.productId && item.productId.userId && item.productId.userId.toString() === req.user.id
    );

    if (req.user.role !== 'admin' && !isVendorOfOrder) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to delete this order"
        });
    }

    if (order.paymentStatus === "completed") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await Order.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};

export const getOrderAnalytics = async (req, res) => {
  try {
    const { period = "month" } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "cancelled" },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const statusData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "cancelled" },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    return res.json({
      success: true,
      data: {
        overview: revenueData[0] || {
          totalRevenue: 0,
          averageOrderValue: 0,
          orderCount: 0,
        },
        statusDistribution: statusData,
        monthlyRevenue,
        period,
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

export const getVendorAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vendorProducts = await Product.find({ userId: vendorId }).select("_id");
        const productIds = vendorProducts.map(p => p._id);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get orders containing this vendor's products
        const orders = await Order.find({
            "items.productId": { $in: productIds },
            orderStatus: { $ne: "cancelled" }
        }).populate("items.productId");

        let totalRevenue = 0;
        let totalOrders = orders.length;
        let totalProducts = vendorProducts.length;
        let customers = new Set();

        orders.forEach(order => {
            customers.add(order.userId.toString());
            order.items.forEach(item => {
                if (productIds.some(id => id.equals(item.productId._id))) {
                    totalRevenue += (item.price * item.quantity);
                }
            });
        });

        // Daily sales for chart (7 days)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const salesData = last7Days.map(date => {
            let dailyRevenue = 0;
            orders.forEach(order => {
                const orderDate = order.createdAt.toISOString().split('T')[0];
                if (orderDate === date) {
                    order.items.forEach(item => {
                        if (productIds.some(id => id.equals(item.productId._id))) {
                            dailyRevenue += (item.price * item.quantity);
                        }
                    });
                }
            });
            return { date, sales: dailyRevenue };
        });

        res.json({
            success: true,
            data: {
                stats: {
                    revenue: totalRevenue,
                    orders: totalOrders,
                    products: totalProducts,
                    customers: customers.size
                },
                salesData,
                categoryData: [] // Optional: fetch category distribution if needed
            }
        });
    } catch (error) {
        console.error("Error fetching vendor analytics:", error);
        res.status(500).json({ success: false, message: "Failed to fetch vendor analytics" });
    }
}

export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get recent orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
    });
  }
};


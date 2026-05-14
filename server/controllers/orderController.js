const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (verified students only)
const placeOrder = async (req, res, next) => {
  try {
    const { items, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one item to your order'
      });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    let maxPrepTime = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${item.menuItem}`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `"${menuItem.name}" is currently unavailable`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      maxPrepTime = Math.max(maxPrepTime, menuItem.preparationTime);

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    // Calculate expected delivery time based on max preparation time
    const expectedDeliveryTime = new Date(Date.now() + maxPrepTime * 60 * 1000);

    const order = await Order.create({
      student: req.user._id,
      items: orderItems,
      totalAmount,
      expectedDeliveryTime,
      specialInstructions,
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        updatedBy: req.user._id
      }]
    });

    // Populate the order for response
    await order.populate('student', 'name email rollNumber');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own orders
// @route   GET /api/orders/my-orders
// @access  Private (student)
const getMyOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { student: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (for canteen owner)
// @route   GET /api/orders/all
// @access  Private (canteenOwner)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const orders = await Order.find(filter)
      .populate('student', 'name email rollNumber phone')
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name email rollNumber phone')
      .populate('items.menuItem', 'name image price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Students can only view their own orders
    if (req.user.role === 'student' && order.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (canteenOwner)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'ready', 'delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a cancelled order'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order is already delivered'
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await order.save();

    // Notify student about status update
    const statusMessages = {
      confirmed: 'Your order has been confirmed! ✅',
      preparing: 'Your order is being prepared! 👨‍🍳',
      ready: 'Your order is ready for pickup! 🎉',
      delivered: 'Your order has been delivered! 😋'
    };

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   POST /api/orders/:id/cancel
// @access  Private (student who placed the order)
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only the student who placed the order can cancel it
    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // RULE 1: Cannot cancel if order is already ready or delivered
    if (['ready', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order — it is already "${order.status}". Please collect your order.`
      });
    }

    // Already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // RULE 2: Cannot cancel within 30 minutes of expected delivery time
    if (order.expectedDeliveryTime) {
      const now = new Date();
      const thirtyMinBefore = new Date(order.expectedDeliveryTime.getTime() - 30 * 60 * 1000);

      if (now >= thirtyMinBefore) {
        const minutesLeft = Math.round((order.expectedDeliveryTime.getTime() - now.getTime()) / 60000);
        return res.status(400).json({
          success: false,
          message: `Cannot cancel — order is expected in ${minutesLeft} minutes. Cancellation is blocked within 30 minutes of delivery.`
        });
      }
    }

    // Proceed with cancellation
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by student';
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: req.user._id
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order stats (for dashboard)
// @route   GET /api/orders/stats
// @access  Private (canteenOwner)
const getOrderStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const pendingOrders = await Order.countDocuments({
      status: { $in: ['placed', 'confirmed', 'preparing'] }
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayOrders,
        pendingOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
};

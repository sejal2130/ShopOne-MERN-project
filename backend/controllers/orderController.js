
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

const addOrderItems = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (
      !address ||
      !address.fullName ||
      !address.street ||
      !address.city ||
      !address.postalCode ||
      !address.country
    ) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    for (const item of items) {
      if (!item.productId || !item.qty || !item.price) {
        return res.status(400).json({
          message: 'Each item needs productId, qty, and price'
        });
      }
    }

    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      address,
      paymentId
    });

    const createdOrder = await order.save();

    // Return the successful order even if email delivery fails.
    try {
      const message = `
        <h2>Order Confirmation</h2>
        <p>Hello ${req.user.name || 'Customer'},</p>
        <p>Your order has been placed. Order ID:
          <strong>${createdOrder._id}</strong>
        </p>
        <p>Order total: ${Number(totalAmount).toFixed(2)}</p>
        <p>Shipping address: ${address.street}, ${address.city}</p>
        <p>Thank you for shopping with ShopNest!</p>
      `;

      await sendEmail({
        email: req.user.email,
        subject: 'ShopNest - Order Confirmation',
        message
      });
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError.message);
    }

    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email');
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus
};

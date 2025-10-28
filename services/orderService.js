const dotenv = require('dotenv');
// Configure .env file
dotenv.config({ path: 'config.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const asyncHandler = require('express-async-handler');
const APIError = require('../utils/apiError');

const factory = require('./handlerFactory');

const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');
const ProductModel = require('../models/productModel');

// Middlewares

const filterOrderForLoggedUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObject = { user: req.user._id };
  next();
});

// @desc Create cash Order
// @route POST /api/v2/orders/cartId
// @access Protect/User

const createCashOrder = asyncHandler(async (req, res, next) => {
  // app-settings
  const taxPrice = 0;
  const shippingPrice = 0;

  const userId = req.user._id;

  // 1- Get logged user Cart
  const { cartId } = req.params;
  const cart = await CartModel.findById(cartId);

  if (!cart) {
    return next(new APIError(`No Cart found with Id: ${cartId}`), 404);
  }

  // 2- Get Order price by cart price (check if Coupon is applied)
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3- Create Order with default paymentMethodType 'cash'
  const order = await OrderModel.create({
    user: userId,
    cartItems: cart.cartItems,
    totalOrderPrice,
  });

  if (order) {
    // 4- After creating Order decrement Product => quantity - increment Product => sold
    const bulkWrites = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await ProductModel.bulkWrite(bulkWrites);

    // 5- Clear Cart
    await CartModel.findByIdAndDelete(cartId);
  }

  res.status(201).json({ status: 'success', data: order });
});

// @desc Get Checkout session from Stripe and send it as response
// @route GET /api/v2/orders/checkout-session/cartId
// @access Protect/User

const checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await CartModel.findById(req.params.cartId);
  if (!cart) {
    return next(
      new APIError(`No such cart with id: ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: totalOrderPrice * 100,
          product_data: { name: req.user.name },
        },
        quantity: 1,
      },
    ],
    currency: 'egp',
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send Session to response
  res.status(200).json({ status: 'success', url: session.url, session });
});

// @desc Get all Orders
// @route POST /api/v2/orders
// @access Protect/User-Admin

const getOrders = factory.getAll(OrderModel);

// @desc Get a specific Order
// @route POST /api/v2/orders/:id
// @access Protect/User-Admin

const getOrderById = factory.getOneById(OrderModel);

// @desc Update Order paid status
// @route PUT /api/v2/orders/:id/pay
// @access Protect/Admin

const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await OrderModel.findById(id);

  if (!order) {
    return next(new APIError(`No Order found with Id: ${id}`), 404);
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc Update Order delivered status
// @route PUT /api/v2/orders/:id/deliver
// @access Protect/Admin

const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await OrderModel.findById(id);

  if (!order) {
    return next(new APIError(`No Order found with Id: ${id}`), 404);
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

module.exports = {
  createCashOrder,
  checkoutSession,
  getOrders,
  filterOrderForLoggedUsers,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
};

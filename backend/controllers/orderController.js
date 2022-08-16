const Order = require('../models/orderModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const ErrHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');
const { findById } = require('../models/productModel');

//create new order  => /api/v1/orders/order/new

exports.newOrder = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  console.log('TTC ON SERVER', typeof totalPrice)

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user.id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

//get single order  /api/v1/orders/order/:id

exports.getSingleOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('user', 'name email');

  if (!order) {
    return next(
      new ErrHandler('Order not found, please check your reference', 404)
    );
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get logged in user orders  /api/v1/orders/order/myorders

exports.myOrders = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const myOrders = await Order.find({ user: id });

  res.status(200).json({
    success: true,
    myOrders,
  });
});

//get all orders as admin => /api/v1/admin/allorders

exports.allOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find();


  //Global total of all orders

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//delete order by admin /api/v1/admin/order/delete/:id

exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrHandler('No product found with this Id', 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});

//update quantity stock for ordered products  for specific order + order status/ process order as admin => /api/v1/admin/order/:id
exports.updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);


   const  updateStock = async(productId, quantity) => {
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false });
  }


  if (order.orderStatus === 'delivered') {
    return next(new ErrHandler('Process completed: Already delivered!', 400));
  }
  //update product stock
  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });
  //update order status
  (order.orderStatus = req.body.status), (order.deliveredAt = Date.now());
  await order.save();

  res.status(200).json({
    success: true,
  });
});



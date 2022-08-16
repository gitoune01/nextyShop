const express = require('express');
const { isAuthUser, isAuthRole } = require('../middlewares/auth');
const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const router = express.Router();

router.get('/order/myorders', isAuthUser, myOrders);
router.post('/order/new', isAuthUser, newOrder);
router.get('/order/:id', isAuthUser, getSingleOrder);
router.get('/admin/allorders', isAuthUser, isAuthRole('admin'), allOrders);
router.put('/admin/order/:id',isAuthUser, isAuthRole('admin'),updateOrder)
router.delete('/admin/order/delete/:id',isAuthUser, isAuthRole('admin'),deleteOrder)


module.exports = router;

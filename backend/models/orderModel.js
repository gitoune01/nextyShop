const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    phoneNo: {
      type: String,
      require: true,
    },
    postalCode: {
      type: String,
      require: true,
    },
    country: {
      type: String,
      require: true,
    },
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      price: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    },
  ],
  paymentInfo:{
    id:{
      type: String,
    },
    status:{
      type: String,
    }
  },
  paidAt:{
     type:Date
  },
  itemsPrice:{
    type:Number,
    required:true,
    default:0.0
  },
  taxPrice:{
    type:Number,
    required:true,
    default:0.0
  },
  shippingPrice:{
    type:Number,
    required:true,
    default:0.0
  },
  totalPrice:{
    type:Number,
    required:true,
    default:0.0
  },
  orderStatus:{
    type:String,
    required:true,
    default:'processing'
  },
  deliveredAt:{
     type:Date,
  },
  createdAt:{
     type:Date,
     default: Date.now
  },
});

module.exports = mongoose.model('Order', orderSchema);

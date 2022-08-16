const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Max of 100 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxlength: [5, 'Max of 5 digits'],
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, 'Please specify a category product'],
    enum: {
      values: [
        'Electronics',
        'Cameras',
        'Laptops',
        'Accessories',
        'Headphones',
        'Food',
        'Books',
        'Clothes/Shoes',
        'Beauty/Health',
        'Sports',
        'Outdoor',
        'Home',
      ],
      message: 'Please select correct category for product',
    },
  },
  seller: {
    type: String,
    required: [true, 'Please provide product seller'],
  },

  stock: {
    type: Number,
    required: [true, 'Please provide product stock'],
    maxlength: [5, 'Can not exceed 5 digits'],
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user:{
        type: mongoose.Types.ObjectId,
        ref:'user',
        required:true
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
 
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Product', productSchema);

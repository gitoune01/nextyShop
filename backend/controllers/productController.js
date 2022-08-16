const Product = require('../models/productModel');
const ErrHandler = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeatures');
// const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config();
//setup cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//create new product

exports.newProduct = asyncHandler(async (req, res, next) => {
  // console.log('REQBODY',req.body)
  console.log('HELLO');

  let images = [];
  if (typeof req.body.images === 'string') {
    //if client upload just 1 image => string - many  => array
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLinks = [];
  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i]);
    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//get all products or certain one by filters/search query ie: .../products?keyword=value&etc...
exports.getProducts = asyncHandler(async (req, res, next) => {
  const resPerPage = 4;
  const productsCount = await Product.countDocuments();
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();

  let allProducts = await apiFeatures.dbquery;
  let filteredProductsCount = allProducts.length;
  apiFeatures.pagination(resPerPage);

  allProducts = await apiFeatures.dbquery.clone(); //dbquery containts Product.find(search criteria)

  res.status(200).json({
    success: true,
    productsCount,
    filteredProductsCount,
    allProducts,
    resPerPage,
  });
});

//get all products for admin dashboard  /api/v1/products/admin/products
exports.getAdminProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getProdById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrHandler('Product not found!', 404));
  }

  console.log('YOU HIT IT !!!!', product.name);

  res.status(200).json({
    success: true,
    product,
  });
});

//update product

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrHandler('Product not found!', 404));
  }

  let images = [];
  if (typeof req.body.images === 'string') {
    //if client upload just 1 image => string - many  => array
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    //delete images associated with this product

    for (let i = 0; i < product.images.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(product.images[i])
        .public_id;
    }
    let imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i]);
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }
  const updatedProd = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    updatedProd,
  });
});
//delete

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrHandler('Product not found!', 404));
  }

  //delete images associated with this product

  for (let i = 0; i < product.images.length; i++) {
    const result = await cloudinary.v2.uploader.destroy(product.images[i])
      .public_id;
  }

  await Product.deleteOne({ _id: id }),
    res.status(200).json({
      success: true,
      message: 'Product is deleted',
    });
});

//new review = /api/v1/reviews/

exports.createProdReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, id } = req.body;

  console.log(req.body);

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(id);

  if (!product) {
    return console.log('No such product');
  }
  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );

  if (isReviewed) {
    //exists ? update it
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    //if not => create first review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  //average rating calc.
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

//get reviews for a specific product => /api/v1/products/reviews/getreviews

exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const { id } = req.query;

  const product = await Product.findById(id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//delete  review
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  //remove request review product from array of product

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.reviewId
  );

  //update ratings
  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //update this product

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      numOfReviews,
      ratings,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
  });
});

const Product = require('../models/productModel');
const products = require('../data/product');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.log(err);
  });

const seedProds = async () => {
  try {
    await Product.deleteMany();
    console.log('All products deleted');
    await Product.insertMany(products);
    console.log('All products created');
    process.exit()
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};
seedProds();

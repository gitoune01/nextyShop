const express = require('express');
const {
  getProducts,
  newProduct,
  getProdById,
  updateProduct,
  deleteProduct,
  createProdReview,
  getProductReviews,
  deleteReview,
  getAdminProducts
} = require('../controllers/productController');
const {isAuthUser,isAuthRole} = require('../middlewares/auth')
const router = express.Router();

router.get('/product/:id', getProdById);
router.get('/allproducts', getProducts);
router.put('/admin/product/:id', isAuthUser,isAuthRole('admin'),updateProduct);
router.delete('/admin/product/:id', isAuthUser,isAuthRole('admin'),deleteProduct);
router.post('/admin/product/new', isAuthUser,isAuthRole('admin'),newProduct);
router.post('/reviews/newreview', isAuthUser, createProdReview)
router.get('/reviews/getreviews', isAuthUser, getProductReviews)
router.delete('/reviews/deletereview',isAuthUser, deleteReview)
router.get('/admin/products',isAuthUser,isAuthRole('admin'), getAdminProducts )

module.exports = router;

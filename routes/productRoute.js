const express = require('express');

const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require('../utils/validators/productValidator');

const {
  createProduct,
  getproducts,
  getProductById,
  updateProductById,
  deleteProductById,
  // Middlewares
  setSlugToBody,
  uploadProductImages,
  resizeProductImages,
  deleteProductImages,
} = require('../services/productService');

const reviewRoute = require('./reviewRoute');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router();

// Nested Route

// POST /products/asfsfdfdafdfdf/reviews
// GET /products/asfsfdfdafdfdf/reviews

// Get Specific Review on a specific product
// GET /products/asfsfdfdafdfdf/reviews/adsadsadsdsad
router.use('/:productId/reviews', reviewRoute);

router.post(
  '/',
  protect,
  allowedTo('admin'),
  uploadProductImages,
  resizeProductImages,
  createProductValidator,
  setSlugToBody,
  createProduct
);

router.get('/', getproducts);

router.get('/:id', getProductValidator, getProductById);

router.put(
  '/:id',
  protect,
  allowedTo('admin', 'manager'),
  uploadProductImages,
  resizeProductImages,
  updateProductValidator,
  setSlugToBody,
  updateProductById,
  deleteProductImages
);

router.delete(
  '/:id',
  protect,
  allowedTo('admin'),
  deleteProductValidator,
  deleteProductById,
  deleteProductImages
);

module.exports = router;

const express = require('express');

const {
  createCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  // Middlewares
  uploadCategoryImage,
  resizeCategoryImage,
  setSlugToBody,
  deleteCategoryImage,
} = require('../services/categoryService');

const { protect, allowedTo } = require('../services/authService');

const subcategoryRoute = require('./subcategoryRoute');

const router = express.Router();

// Nested Route
router.use('/:categoryId/subcategories', subcategoryRoute);

router.post(
  '/',
  // protect,
  // allowedTo('admin', 'manager'),
  uploadCategoryImage,
  resizeCategoryImage,
  createCategoryValidator,
  setSlugToBody,
  createCategory
);
router.get('/', getCategories);
router.get('/:id', getCategoryValidator, getCategoryById);
router.put(
  '/:id',
  // protect,
  // allowedTo('admin', 'manager'),
  uploadCategoryImage,
  resizeCategoryImage,
  updateCategoryValidator,
  setSlugToBody,
  updateCategoryById,
  deleteCategoryImage
);
router.delete(
  '/:id',
  // protect,
  // allowedTo('admin'),
  deleteCategoryValidator,
  deleteCategoryById,
  deleteCategoryImage
);

module.exports = router;

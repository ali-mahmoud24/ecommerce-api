const express = require('express');

const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require('../utils/validators/brandValidator');

const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
  // Middlewares
  setSlugToBody,
  uploadBrandImage,
  resizeBrandImage,
  deleteBrandImage,
} = require('../services/brandService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router();

router.post(
  '/',
  protect,
  allowedTo('admin', 'manager'),
  uploadBrandImage,
  resizeBrandImage,
  createBrandValidator,
  setSlugToBody,
  createBrand
);
router.get('/', getBrands);
router.get('/:id', getBrandValidator, getBrandById);
router.put(
  '/:id',
  protect,
  allowedTo('admin', 'manager'),
  uploadBrandImage,
  resizeBrandImage,
  updateBrandValidator,
  setSlugToBody,
  updateBrandById,
  deleteBrandImage
);
router.delete(
  '/:id',
  protect,
  allowedTo('admin'),
  deleteBrandValidator,
  deleteBrandById,
  deleteBrandImage
);

module.exports = router;

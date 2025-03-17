const slugify = require('slugify');

const BrandModel = require('../models/brandModel');
const factory = require('./handlerFactory');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { resizeImage } = require('../middlewares/resizeImageMiddleware');
const {
  deleteImageMiddleware,
} = require('../middlewares/deleteImageMiddleware');

// Middlewares

const uploadBrandImage = uploadSingleImage('image');
const resizeBrandImage = resizeImage('brands', 'brand', 'image');
const deleteBrandImage = deleteImageMiddleware('brands');

const setSlugToBody = (req, res, next) => {
  if (req.body.name) {
    const { name } = req.body;
    req.body.slug = slugify(name);
  }

  next();
};

// @ desc   Create brand
// @ route  POST    /api/v1/brands
// @ access Private

const createBrand = factory.createOne(BrandModel);

// @ desc   Get list of brands
// @ route  GET    /api/v1/brands
// @ access Public

const getBrands = factory.getAll(BrandModel);

// @ desc   Get specific brand by id
// @ route  GET    /api/v1/brands/:id
// @ access Public

const getBrandById = factory.getOneById(BrandModel);

// @ desc   Update specific brand
// @ route  PUT    /api/v1/brands/:id
// @ access Private

const updateBrandById = factory.updateOneById(BrandModel, 'image');

// @ desc   Delete specific Brand
// @ route  DELETE    /api/v1/brands/:id
// @ access Private

const deleteBrandById = factory.deleteOne(BrandModel, 'image');

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
  // Middlewares
  uploadBrandImage,
  resizeBrandImage,
  setSlugToBody,
  deleteBrandImage,
};

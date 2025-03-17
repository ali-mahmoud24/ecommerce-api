const slugify = require('slugify');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const { resizeImage } = require('../middlewares/resizeImageMiddleware');
const {
  deleteImageMiddleware,
} = require('../middlewares/deleteImageMiddleware');

const CategoryModel = require('../models/categoryModel');
const factory = require('./handlerFactory');

// Middlewares
const uploadCategoryImage = uploadSingleImage('image');
const resizeCategoryImage = resizeImage('categories', 'category', 'image');
const deleteCategoryImage = deleteImageMiddleware('categories');

const setSlugToBody = (req, res, next) => {
  if (req.body.name) {
    const { name } = req.body;
    req.body.slug = slugify(name);
  }

  next();
};

// @ desc   Create category
// @ route  POST    /api/v1/categories
// @ access Private

const createCategory = factory.createOne(CategoryModel);

// @ desc   Get list of categories
// @ route  GET    /api/v1/categories
// @ access Public

const getCategories = factory.getAll(CategoryModel, 'Category');

// @ desc   Get specific category by id
// @ route  GET    /api/v1/categories/:id
// @ access Public

const getCategoryById = factory.getOneById(CategoryModel, 'Category');

// @ desc   Update specific category
// @ route  PUT    /api/v1/categories/:id
// @ access Private

const updateCategoryById = factory.updateOneById(
  CategoryModel,
  'Category',
  'image'
);

// @ desc   Delete specific category
// @ route  DELETE    /api/v1/categories/:id
// @ access Private

const deleteCategoryById = factory.deleteOne(
  CategoryModel,
  'Category',
  'image'
);

module.exports = {
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
};

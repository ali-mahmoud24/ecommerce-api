const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

const getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id format.'),
  validatorMiddleware,
];

const createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category name required.')
    .isLength({ min: 3 })
    .withMessage('Min Length is 3')
    .isLength({ max: 32 })
    .withMessage('Max Length is 32'),
  check('image').notEmpty().withMessage('Category image required.'),

  validatorMiddleware,
];

const updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id format.'),
  validatorMiddleware,
];

const deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Category Id format.'),
  validatorMiddleware,
];

module.exports = {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
};

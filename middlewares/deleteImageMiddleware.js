const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const APIError = require('../utils/apiError');

const deleteImageMiddleware = () =>
  asyncHandler(async (req, res, next) => {
    const { image } = res.locals; // image = Cloudinary public_id

    if (!image) return next();

    try {
      await cloudinary.uploader.destroy(image);
      next();
    } catch (error) {
      next(new APIError('Error deleting image from Cloudinary', 500));
    }
  });

const deleteMixOfImagesMiddleware = () =>
  asyncHandler(async (req, res, next) => {
    const { images } = res.locals; // array of Cloudinary public_ids

    if (!images.length) return next();

    try {
      await Promise.all(images.map((id) => cloudinary.uploader.destroy(id)));
      next();
    } catch (error) {
      next(new APIError('Error deleting multiple images from Cloudinary', 500));
    }
  });

module.exports = {
  deleteImageMiddleware,
  deleteMixOfImagesMiddleware,
};

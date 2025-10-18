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
    const images = res.locals.images || [];
    const { image } = res.locals; // single image (e.g., imageCover)

    try {
      if (Array.isArray(images) && images.length > 0) {
        await Promise.all(
          images.filter(Boolean).map((id) => cloudinary.uploader.destroy(id))
        );
      }

      if (image) {
        await cloudinary.uploader.destroy(image);
      }

      next();
    } catch (error) {
      next(new APIError('Error deleting images from Cloudinary', 500));
    }
  });

const deleteCloudinaryImages = () =>
  asyncHandler(async (req, res, next) => {
    const { image, images } = res.locals;

    try {
      if (Array.isArray(images) && images.length > 0) {
        await Promise.all(
          images.filter(Boolean).map((id) => cloudinary.uploader.destroy(id))
        );
      }
      if (image) {
        await cloudinary.uploader.destroy(image);
      }
    } catch (error) {
      next(new APIError('Error deleting image from Cloudinary', 500));
    }

    console.log('done');

    next();
  });

module.exports = {
  deleteImageMiddleware,
  deleteMixOfImagesMiddleware,
  deleteCloudinaryImages,
};

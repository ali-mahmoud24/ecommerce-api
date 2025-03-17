const fs = require('fs/promises');
const path = require('path');

const asyncHandler = require('express-async-handler');

const APIError = require('../utils/apiError');

const getImagePath = (folderName, filename) => {
  const imagePath = path.join(__dirname, '..', 'uploads', folderName, filename); // Adjust path

  return imagePath;
};

const deleteImageMiddleware = (folderName) =>
  asyncHandler(async (req, res, next) => {
    const { filename } = res.locals; // We'll use res.locals to get the document from the previous middleware

    if (filename) {
      const imagePath = getImagePath(folderName, filename);
      // Delete the image from the file system

      const error = await fs.unlink(imagePath);
      if (error) {
        return next(new APIError(`Error deleting associated image`, 500));
      }
    }
  });

const deleteMixOfImagesMiddleware = (folderName) =>
  asyncHandler(async (req, res, next) => {
    const { filename } = res.locals;
    const { filenames } = res.locals;

    if (filename) {
      const imagePath = getImagePath(folderName, filename);

      // Delete the image from the file system
      const error = await fs.unlink(imagePath);
      if (error) {
        return next(new APIError(`Error deleting associated image`, 500));
      }
    }

    if (filenames) {
      await Promise.all(
        filenames.forEach(async (file) => {
          const imagePath = getImagePath(folderName, file);

          // Delete the image from the file system
          const error = await fs.unlink(imagePath);
          if (error) {
            return next(new APIError(`Error deleting associated image`, 500));
          }
        })
      );
    }
  });

module.exports = {
  deleteImageMiddleware,
  deleteMixOfImagesMiddleware,
};

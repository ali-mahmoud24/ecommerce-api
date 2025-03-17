const asyncHandler = require('express-async-handler');

const { v4: uuid } = require('uuid');
const sharp = require('sharp');

const resizeImage = (folderName, entityName, imageField) =>
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const inputBuffer = req.file.buffer;

    const id = uuid();
    const filename = `${entityName}-${id}-${Date.now()}.jpeg`;

    await sharp(inputBuffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/${folderName}/${filename}`);

    // Save image into request object
    req.body[imageField] = filename;

    next();
  });

const resizeMixOfImages = (
  folderName,
  entityName,
  singleImageField,
  multipleImagesField
) =>
  asyncHandler(async (req, res, next) => {
    if (!req.files) {
      return next();
    }

    // 1-  Image Processing for singleImageField
    if (req.files[singleImageField]) {
      const image = req.files[singleImageField];
      const inputBuffer = image[0].buffer;

      const id = uuid();
      const filename = `${entityName}-${id}-${Date.now()}-cover.jpeg`;

      await sharp(inputBuffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`uploads/${folderName}/${filename}`);

      // Save image into request object
      req.body[singleImageField] = filename;
    }

    // 2-  Image Processing for multipleImagesField
    if (req.files[multipleImagesField]) {
      const images = req.files[multipleImagesField];

      const filenames = await Promise.all(
        images.map(async (image, index) => {
          const inputBuffer = image.buffer;

          const id = uuid();
          const filename = `${entityName}-${id}-${Date.now()}-${index + 1}.jpeg`;

          await sharp(inputBuffer)
            .resize(900, 900)
            .toFormat('jpeg')
            .jpeg({ quality: 95 })
            .toFile(`uploads/${folderName}/${filename}`);

          return filename;
        })
      );
      // Save images into request object
      req.body.images = filenames;
    }

    next();
  });

module.exports = {
  resizeImage,
  resizeMixOfImages,
};

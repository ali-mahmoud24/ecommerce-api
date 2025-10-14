const asyncHandler = require('express-async-handler');
const { v4: uuid } = require('uuid');
const sharp = require('sharp');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const MAIN_FOLDER = 'shoply';

// helper to upload sharp buffer to cloudinary
const uploadToCloudinary = (buffer, folder, filename) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${MAIN_FOLDER}/${folder}`,
        public_id: filename,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const resizeImage = (folderName, entityName, imageField) =>
  asyncHandler(async (req, res, next) => {
    if (!req.file) return next();

    const id = uuid();
    const filename = `${entityName}-${id}-${Date.now()}`;

    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const uploadResult = await uploadToCloudinary(buffer, folderName, filename);

    // same field names as before
    req.body[imageField] = uploadResult.public_id;
    req.body.imageUrl = uploadResult.secure_url;

    next();
  });

const resizeMixOfImages = (
  folderName,
  entityName,
  singleImageField,
  multipleImagesField
) =>
  asyncHandler(async (req, res, next) => {
    if (!req.files) return next();

    // Single image (e.g. cover)
    if (req.files[singleImageField]) {
      const image = req.files[singleImageField][0];
      const id = uuid();
      const filename = `${entityName}-${id}-${Date.now()}-cover`;

      const buffer = await sharp(image.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toBuffer();

      const result = await uploadToCloudinary(buffer, folderName, filename);

      req.body[singleImageField] = result.public_id;
      req.body.imageUrl = result.secure_url;
    }

    // Multiple images
    if (req.files[multipleImagesField]) {
      const images = req.files[multipleImagesField];
      const results = await Promise.all(
        images.map(async (image, index) => {
          const id = uuid();
          const filename = `${entityName}-${id}-${Date.now()}-${index + 1}`;

          const buffer = await sharp(image.buffer)
            .resize(900, 900)
            .toFormat('jpeg')
            .jpeg({ quality: 95 })
            .toBuffer();

          const uploadResult = await uploadToCloudinary(
            buffer,
            folderName,
            filename
          );
          return {
            image: uploadResult.public_id,
            imageUrl: uploadResult.secure_url,
          };
        })
      );

      req.body.images = results.map((r) => r.image);
      req.body.imagesUrls = results.map((r) => r.imageUrl);
    }

    next();
  });

module.exports = {
  resizeImage,
  resizeMixOfImages,
};

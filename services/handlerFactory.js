const asyncHandler = require('express-async-handler');

const APIError = require('../utils/apiError');
const APIFeature = require('../utils/apiFeature');

const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    await document.save();

    res.status(201).json({ data: document });
  });

const getAll = (Model, populateOptions) =>
  asyncHandler(async (req, res) => {
    // Check for filter
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }

    // Build Query
    const apiFeature = new APIFeature(Model.find(filter), req.query)
      .filter()
      .search(Model.modelName)
      .limitFields()
      .sort();

    await apiFeature.count();

    apiFeature.paginate(apiFeature.count);

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeature;

    let query = mongooseQuery;
    if (populateOptions) {
      query = mongooseQuery.populate(populateOptions);
    }

    // Populate and execute
    const documents = await query.exec();

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

const getOneById = (Model, populateOptions) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // 1- Build query
    let query = Model.findById(id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    // 2- Execute query
    const document = await query;

    if (!document) {
      return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });

const updateOneById = (Model, imageField, multipleImagesField) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findById(id);

    if (!document) {
      return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));
    }

    const updatedDocument = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // Trigger "save" event when update document
    await updatedDocument.save();

    // To delete old Mix of images
    if (req.files && imageField && multipleImagesField) {
      if (req.files[imageField]) {
        res.locals.filename = document[imageField];
      }
      if (req.files[multipleImagesField]) {
        res.locals.filenames = document[multipleImagesField];
      }

      // Proceed to the next middleware (image deletion)
      next();
    }

    // If there is an image in the request and the document has an existing image, delete the old image
    if (req.file && document[imageField] && !multipleImagesField) {
      res.locals.filename = document[imageField];
      next();
    }

    res.status(200).json({ data: updatedDocument });
  });

const deleteOne = (Model, imageField, multipleImagesField) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new APIError(`No ${Model.modelName} for this Id ${id}`, 404));
    }

    if (document) {
      if (Model.modelName === 'Review') {
        const productId = document.product;

        // Recalculate average ratings and quantity for the product
        await Model.calculateAverageRatingsAndQuantity(productId);
      }
    }

    // To delete single image
    if (imageField && !multipleImagesField) {
      // Store the document in res.locals so it can be accessed in subsequent middleware
      res.locals.filename = document[imageField];

      // Proceed to the next middleware (image deletion)
      next();
    }

    // To delete Mix of images
    if (imageField && multipleImagesField) {
      res.locals.filename = document[imageField];
      res.locals.filenames = document[multipleImagesField];

      // Proceed to the next middleware (image deletion)
      next();
    }

    res.status(204).json();
  });

module.exports = {
  createOne,
  getAll,
  getOneById,
  updateOneById,
  deleteOne,
};

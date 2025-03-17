const mongoose = require('mongoose');
const ProductModel = require('./productModel');

// 1- Create Schema

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, 'Minimun rating value is 1.0'],
      max: [5, 'Minimun rating value is 5.0'],
      required: [true, 'Review rating is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User'],
    },
    
    // Parent refrence (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a Product'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

// Add static methods
reviewSchema.statics.calculateAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    // Stage 1 : Get all reviews in a specific product
    {
      $match: { product: productId },
    },
    // Stage 2 : Group reviews based on productId and calc averageRating, numOfRatings
    {
      $group: {
        _id: 'product',
        averageRating: { $avg: '$rating' },
        numOfRatings: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: result[0].averageRating,
      numOfRatings: result[0].numOfRatings,
    });
  } else {
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: 0,
      numOfRatings: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRatingsAndQuantity(this.product);
});

// 2- Create model
const ReviewModel = mongoose.model('Review', reviewSchema);

module.exports = ReviewModel;

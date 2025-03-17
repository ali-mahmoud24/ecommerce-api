const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      unique: [true, 'Subcategory must be unique'],
      minLength: [2, 'Too short Subcategory name'],
      maxLength: [32, 'Too long Subcategory name'],
    },
    slug: {
      type: String,
      required: [true, 'Subcategory slug is required'],
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      requried: [true, 'Subcategory must belong to a Category'],
    },
  },
  { timestamps: true }
);

const SubcategoryModel = mongoose.model('Subcategory', subcategorySchema);

module.exports = SubcategoryModel;

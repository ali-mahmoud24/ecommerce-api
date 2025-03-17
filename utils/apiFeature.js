class APIFeature {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  // 1) Filtering
  filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ['page', 'limit', 'sort', 'fields', 'keyword'];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    // Apply filtering using (gte, gt, lte, lt)
    // /products?averageRating[lt]=4&price[gte]=100

    // { price: {$gte: 50}, averageRating: {$gte: 4} }
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    this.mongooseQuery = this.mongooseQuery.find(queryStr);

    return this;
  }

  // 2) Sorting
  // { sort: "price", sort: "-price", sort: "price - averageRating" }
  sort() {
    if (this.queryString.sort) {
      const { sort } = this.queryString;

      // "price,sold" ==> "price sold"
      const sortBy = sort.split(',').join(' ');

      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }

    return this;
  }

  // 3) Fields Limitng
  limitFields() {
    if (this.queryString.fields) {
      const { fields } = this.queryString;
      const selectedFields = fields.split(',').join(' ');

      this.mongooseQuery.select(selectedFields);
    } else {
      this.mongooseQuery.select('-__v');
    }

    return this;
  }

  //  4) Search
  search(modelName) {
    if (this.queryString.keyword) {
      let query = {};

      if (modelName === 'Product') {
        query = {
          $or: [
            { title: { $regex: this.queryString.keyword, $options: 'i' } },
            {
              description: { $regex: this.queryString.keyword, $options: 'i' },
            },
          ],
        };
      } else {
        query = {
          $or: [{ name: { $regex: this.queryString.keyword, $options: 'i' } }],
        };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  // 5) Pagination
  paginate(countDocuments) {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 50;
    const skip = (page - 1) * limit;

    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    // next page
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }

    // previous page
    if (skip > 0) {
      pagination.previous = page - 1;
    }

    // Build query
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }

  async count() {
    // Clone the original query to avoid altering it
    const queryClone = this.mongooseQuery.clone();

    // Execute the count on the cloned query
    const count = await queryClone.countDocuments();

    // Store the count in the instance
    this.count = count;
  }
}

module.exports = APIFeature;

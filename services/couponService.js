const factory = require('./handlerFactory');
const CouponModel = require('../models/couponModel');

// @ desc   Create coupon
// @ route  POST    /api/v1/coupons
// @ access Protect/Admin

const createCoupon = factory.createOne(CouponModel);

// @ desc   Get list of coupons
// @ route  GET    /api/v1/coupons
// @ access Protect/Admin

const getCoupons = factory.getAll(CouponModel, 'Coupon');

// @ desc   Get specific coupon by id
// @ route  GET    /api/v1/coupons/:id
// @ access Protect/Admin

const getCouponById = factory.getOneById(CouponModel, 'Coupon');

// @ desc   Update specific coupon
// @ route  PUT    /api/v1/coupons/:id
// @ access Protect/Admin

const updateCouponById = factory.updateOneById(CouponModel, 'Coupon');

// @ desc   Delete specific coupon
// @ route  DELETE    /api/v1/coupons/:id
// @ access Protect/Admin

const deleteCouponById = factory.deleteOne(CouponModel, 'Coupon');

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
};

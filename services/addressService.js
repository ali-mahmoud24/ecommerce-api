const asyncHandler = require('express-async-handler');

const UserModel = require('../models/userModel');

// @ desc   Add Address to addresses list
// @ route  POST    /api/v1/addresses
// @ access Protect/User

const addAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const {
    alias,
    country,
    city,
    street,
    building,
    apartment,
    details,
    phone,
    postalCode,
  } = req.body;

  const newAddress = {
    alias,
    country,
    city,
    street,
    building,
    apartment,
    details,
    phone,
    postalCode,
  };

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      //  $addToSet => adds a unique element to array
      $addToSet: {
        addresses: newAddress,
      },
    },
    { new: true }
  );

  res.status(200).json({
    data: user.addresses,
    status: 'Succees',
    message: 'Address added succesfully',
  });
});

// @ desc   Edit secific
// @ route  PATCH    /api/v1/addresses
// @ access Protect/User

// const editAddress = asyncHandler(async (req, res, next) => {});

// @ desc   Remove Address
// @ route  DELETE    /api/v1/addresses/:id
// @ access Protect/User

const removeAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { id: addressId } = req.params;

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: { addresses: { _id: addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    data: user.addresses,
    status: 'Succees',
    message: 'Address removed succesfully',
  });
});

// @ desc   Get Logged User Addresses
// @ route  Get    /api/v1/addresses
// @ access Protect/User

const getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await UserModel.findById(userId);

  res.status(200).json({
    results: user.addresses.length,
    data: user.addresses,
  });
});

module.exports = {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
};

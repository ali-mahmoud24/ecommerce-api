const express = require('express');

const {
  addAddressValidator,
  removeAddressValidator,
} = require('../utils/validators/addressValidator');

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require('../services/addressService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router({ mergeParams: true });

// Middleware for all upcoming routes
router.use(protect, allowedTo('user'));

router.post('/', addAddressValidator, addAddress);

router.get('/', getLoggedUserAddresses);

router.delete('/:id', removeAddressValidator, removeAddress);

module.exports = router;

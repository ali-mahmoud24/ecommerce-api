const express = require('express');

const {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
  deleteUserValidator,

  changeLoggedUserPasswordValidator,
  updateLoggedUserValidator,
} = require('../utils/validators/userValidator');

const { loginValidator } = require('../utils/validators/authValidator');

const {
  createUser,
  getUsers,
  getUserById,
  updateUserById,
  changeUserPassword,
  deleteUserById,
  // Middlewares
  setSlugToBody,
  uploadUserImage,
  resizeUserImage,
  deleteUserImage,

  getLoggedUserData,
  changeLoggedUserPassword,
  updateLoggedUserData,
  deactivateLoggedUser,
  reactivateUserAccount,
} = require('../services/userService');

const { protect, allowedTo } = require('../services/authService');

const router = express.Router();

router.post('/activateAccount', loginValidator, reactivateUserAccount);

router.use(protect);

// USER

router.get('/profile', getLoggedUserData, getUserById);
router.patch(
  '/changeMyPassword',
  changeLoggedUserPasswordValidator,
  changeLoggedUserPassword
);
router.put(
  '/updateMe',
  uploadUserImage,
  resizeUserImage,
  updateLoggedUserValidator,
  updateLoggedUserData,
  deleteUserImage
);
router.delete('/deactivateMe', deactivateLoggedUser);

// ADMIN
// Apply to all upcoming routes
router.use(allowedTo('admin'));

router.post(
  '/',
  uploadUserImage,
  resizeUserImage,
  createUserValidator,
  setSlugToBody,
  createUser
);
router.get('/', getUsers);

router.get('/:id', getUserValidator, getUserById);

router.put(
  '/:id',
  uploadUserImage,
  resizeUserImage,
  updateUserValidator,
  setSlugToBody,
  updateUserById,
  deleteUserImage
);

router.delete('/:id', deleteUserValidator, deleteUserById, deleteUserImage);

router.patch(
  '/changePassword/:id',
  changeUserPasswordValidator,
  changeUserPassword
);

module.exports = router;

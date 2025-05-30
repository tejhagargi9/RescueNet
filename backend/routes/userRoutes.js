const express = require('express');
const {
  getCurrentUser,
  onboardOrUpdateUser,
  deleteCurrentUser,
  getAllUsers
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/clerkAuth');

const router = express.Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private (optionally add admin-only middleware)
router.get('/allUsers', requireAuth, getAllUsers);

// @route   GET api/users/me
// @desc    Get current logged-in user's profile
// @access  Private
router.get('/me', requireAuth, getCurrentUser);

// @route   PUT api/users/me
// @desc    Onboard new user or Update existing user's profile details
// @access  Private
router.put('/me', requireAuth, onboardOrUpdateUser);

// @route   DELETE api/users/me
// @desc    Delete current logged-in user's account
// @access  Private
router.delete('/me', requireAuth, deleteCurrentUser);

module.exports = router;

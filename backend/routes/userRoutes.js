const express = require('express');
const { getCurrentUser, onboardOrUpdateUser, deleteCurrentUser } = require('../controllers/userController');
const { requireAuth } = require('../middleware/clerkAuth');

const router = express.Router();

// @route   GET api/users/me
// @desc    Get current logged-in user's profile
// @access  Private
router.get('/me', requireAuth, getCurrentUser);

// @route   PUT api/users/me (or /onboard)
// @desc    Onboard new user or Update existing user's profile details
// @access  Private
router.put('/me', requireAuth, onboardOrUpdateUser); // Using PUT on /me for updates including onboarding

// @route   DELETE api/users/me
// @desc    Delete current logged-in user's account
// @access  Private
router.delete('/me', requireAuth, deleteCurrentUser);

module.exports = router;
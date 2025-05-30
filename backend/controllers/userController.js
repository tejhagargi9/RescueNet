const User = require('../models/User');
const { clerkClient } = require('@clerk/clerk-sdk-node'); // For deleting user from Clerk

// Get current user's profile (merged from DB)
const getCurrentUser = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'User not authenticated (Clerk User ID missing)' });
    }

    let user = await User.findOne({ clerkUserId });

    if (!user) {
      // This case might happen if webhook hasn't processed yet or if there was an issue
      // Optionally, try to fetch from Clerk and create a basic profile
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      if (clerkUser) {
        user = new User({
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          fullName: clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser.username,
          imageUrl: clerkUser.imageUrl,
          clerkCreatedAt: new Date(clerkUser.createdAt),
          role: 'guest', // default until onboarded
          onboarded: false
        });
        await user.save();
      } else {
        return res.status(404).json({ message: 'User not found in Clerk or local DB.' });
      }
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    next(error);
  }
};

const updateUserFCMToken = async (req, res) => {
  const { fcmToken } = req.body;
  // req.user.id should be available from your authentication middleware
  const userId = req.user?.id;


  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (!fcmToken) {
    return res.status(400).json({ message: 'FCM token is required.' });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'FCM token updated successfully.' });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({ message: 'Server error while updating FCM token.' });
  }
};

// @desc    Update current location for a logged-in volunteer
// @route   POST /api/users/location
// @access  Private (for Volunteers)
const updateUserLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Valid latitude and longitude are required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.userType !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can update active location.' });
    }

    user.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude], // GeoJSON: longitude first
    };
    await user.save();
    res.status(200).json({ message: 'Location updated successfully.' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error while updating location.' });
  }
};

// Onboard or Update user profile
const onboardOrUpdateUser = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    const { role, age, disabilities, phoneNumbers, addresses, location } = req.body;

    if (!clerkUserId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!role || (role !== 'citizen' && role !== 'volunteer')) {
      return res.status(400).json({ message: 'Valid role (citizen or volunteer) is required for onboarding.' });
    }

    const updateData = {
      role,
      onboarded: true,
      phoneNumbers: Array.isArray(phoneNumbers) ? phoneNumbers.filter(p => p && p.trim() !== "") : [],
      addresses: Array.isArray(addresses) ? addresses.filter(a => a && a.trim() !== "") : [],
      location,
    };

    if (role === 'citizen') {
      if (age) updateData.age = parseInt(age, 10);
      if (disabilities !== undefined) updateData.disabilities = disabilities;
    }
    // Add volunteer specific fields if any, e.g. updateData.serviceAreas = serviceAreas;

    const user = await User.findOneAndUpdate(
      { clerkUserId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true } // Upsert might be risky if webhook isn't guaranteed to run first
      // Consider finding first, if not found, error or create based on Clerk data + onboarding data.
      // For now, assuming webhook creates the base user or getCurrentUser does.
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found to update. Webhook might not have processed yet.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error onboarding/updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    next(error);
  }
};

// Delete user account (from DB and Clerk)
const deleteCurrentUser = async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    if (!clerkUserId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Delete from Clerk
    try {
      await clerkClient.users.deleteUser(clerkUserId);
      console.log(`User ${clerkUserId} deleted from Clerk.`);
    } catch (clerkError) {
      console.error(`Error deleting user ${clerkUserId} from Clerk:`, clerkError.errors || clerkError.message);
      // Decide if you want to proceed with DB deletion or not.
      // It's generally better to ensure Clerk deletion succeeds or handle retry.
      // For now, we'll proceed but log the error.
      // If Clerk user is already deleted, it might throw an error which we can ignore.
      if (clerkError.status !== 404) { // 404 means user not found in Clerk (already deleted)
        return next(clerkError); // Propagate other Clerk errors
      }
    }

    // Delete from MongoDB
    const deletedUser = await User.findOneAndDelete({ clerkUserId });
    if (!deletedUser) {
      // This could happen if the user was already deleted or never fully existed in local DB
      console.log(`User ${clerkUserId} not found in local DB for deletion, or already deleted.`);
      return res.status(200).json({ message: 'User already deleted or not found in local DB, and successfully processed with Clerk.' });
    }

    console.log(`User ${clerkUserId} deleted from MongoDB.`);
    res.status(200).json({ message: 'User account deleted successfully from all systems.' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    next(error);
  }
};


module.exports = {
  getCurrentUser,
  onboardOrUpdateUser,
  deleteCurrentUser,
  updateUserFCMToken,
  updateUserLocation
};
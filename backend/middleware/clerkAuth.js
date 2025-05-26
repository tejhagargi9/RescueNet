const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

// This middleware will protect routes and make req.auth available.
// It will throw an error if the user is not authenticated.
const requireAuth = ClerkExpressRequireAuth({
  // You can add options here if needed, e.g., authorizedParties
});


// Optional: A middleware to get user without requiring auth, useful for some public GET routes
// that behave differently if a user is logged in.
// const optionalAuth = ClerkExpressWithAuth({});

module.exports = { requireAuth };
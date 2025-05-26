const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Clerk authentication errors often have a status property
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Something went wrong on the server.';

  // Handle Clerk specific errors more gracefully if needed
  if (err.clerkError) {
    const clerkErrors = err.errors || [{ message: "Authentication error" }];
    return res.status(statusCode).json({
      message: clerkErrors[0].longMessage || clerkErrors[0].message,
      errors: clerkErrors,
      clerkError: true,
    });
  }

  res.status(statusCode).json({
    message: message,
    // Optionally, include stack in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
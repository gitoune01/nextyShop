const ErrorHandler = require('../utils/errorHandler');
//////////////////GLOBAL ERROR HANDLER CALLED AT BOTTOM OF APP SERVER -- AND SHAPING INCOMING ERRORS//////////////////

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  //Wrong mongoosse Object ID and Error => random string in URL
  if (err.kind === 'ObjectId') {
    const message = `No matching ressource. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Handling Mongoose validation Error(show error message from the model)

  if (err.name === 'ValidationError') {
    err.message = err.message.slice(33);
    err = new ErrorHandler(err.message, 400);
  }
  // if(err.errors.name.name === 'ValidatorError'){
  //   console.log(err.errors.name.message)
  //   message = err.errors.name.message
  //   err = new ErrorHandler(message, 400);
  // }

  //duplicate account emails
  if (err.code && err.code === 11000) {
    console.log(err.stack);
    err.message = 'Account with such email already exists.';
    err = new ErrorHandler(err.message, 401);
  }

  //handling JWT Errors

  if (err.name === 'JsonwebTokenError') {
    const message = 'JSON web Token is invalid. Try Again!!!.';
    err = new ErrorHandler(message, 400);
  }
  //handling expired JWT

  if (err.name === 'TokenExpiredError') {
    const message = 'JSON web Token is expired. Try Again!!!.';
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message || 'Internal  Server Error',
  });
};

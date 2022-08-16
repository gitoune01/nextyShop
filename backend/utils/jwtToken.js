//create and send token and save in cookie (http cookie not accessible by js as oppose to localstorage)

const sendToken = (user, statusCode, res) => {
  //create jwt token
  const token = user.getJwtToken();

  //options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPRESS_TIME * 24 * 60 * 60 * 1000 //en millisecondes.
    ),
    httpOnly: true, //not js accessible
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendToken;

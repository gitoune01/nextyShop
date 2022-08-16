const ErrHandler = require('../utils/errorHandler');
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

//process stripe payment  => /api/v1/payment/process



//first send public key => /api/v1/payments/payment/stripe
exports.sendStripeApi = asyncHandler(async (req, res, next) => {

  res.status(200).json({
     stripeApiKey: process.env.STRIPE_API_KEY

  })
});



exports.processPayment = asyncHandler(async (req, res, next) => {
  //second send secret to client
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'usd',
    metadata :{integration_check: 'accept_a_payment'}
  });

  res.status(200).json({
        success:true,
        client_secret: paymentIntent.client_secret
  })
});


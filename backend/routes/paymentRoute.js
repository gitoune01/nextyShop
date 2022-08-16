const express = require('express')
const {isAuthUser} = require('../middlewares/auth')
const {processPayment, sendStripeApi} = require('../controllers/paymentController')
const router = express.Router()


router.post('/payment/process', isAuthUser, processPayment)
router.get('/payment/stripe', isAuthUser, sendStripeApi)



module.exports =  router
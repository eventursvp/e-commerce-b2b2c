const express = require('express');
const { jwtValidation } = require("model-hook/middleware/jwtValidation")

const router = express.Router();

const {checkout,paymentVerification} = require('../controller/payment');

router.post('/checkout',checkout);
router.post('/paymentVerification',paymentVerification);




module.exports = router;

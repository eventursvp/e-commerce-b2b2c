const express = require('express');
const { jwtValidation } = require("model-hook/middleware/jwtValidation")

const router = express.Router();

const {getOneInvoice,getAllInvoice} = require('../controller/getInvoice');


router.post('/getOneInvoice',jwtValidation,getOneInvoice);
router.post('/getAllInvoice',jwtValidation,getAllInvoice);
// router.post('/getAllOrders',jwtValidation,getAllOrders);
// router.post('/getVendorOrders',jwtValidation,getVendorOrders);




module.exports = router;
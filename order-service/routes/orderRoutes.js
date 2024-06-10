const express = require('express');
const { jwtValidation } = require("model-hook/middleware/jwtValidation")

const router = express.Router();

const {createOrder} = require('../controller/createOrder');
const {getOrder,getAllOrders,getAdminOrders,getVendorOrders} = require('../controller/getOrder');
const {cancelOrder} = require('../controller/cancelOrder');
const {returnOrder} = require('../controller/returnOrder');
const {deliverdOrder} = require('../controller/deliverdOrder');

const {updateStatus} = require('../controller/updateStatus');

router.post('/createOrder',jwtValidation,createOrder);
router.post('/getOrder',jwtValidation,getOrder);
router.post('/getAllOrders',jwtValidation,getAllOrders);
router.post('/getVendorOrders',jwtValidation,getVendorOrders);


router.post('/getAdminOrders',jwtValidation,getAdminOrders);

router.post('/cancelOrder',jwtValidation,cancelOrder);
router.post('/returnOrder',jwtValidation,returnOrder);
router.post('/deliverdOrder',jwtValidation,deliverdOrder);

router.post('/updateStatus',jwtValidation,updateStatus);










module.exports = router;
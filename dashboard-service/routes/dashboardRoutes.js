const express = require('express');
const { jwtValidation } = require("model-hook/middleware/jwtValidation")

const router = express.Router();

const {getTotalCount} = require('../controller/getTotalCount');
const {getTotalUsers} = require('../controller/getTotalUsers');
const {getTotalSellers} = require('../controller/getTotalSellers');
const {getTotalSales,getOrderStats} = require('../controller/getTotalSeles');



router.post('/getTotalCount',jwtValidation,getTotalCount);
router.post('/getTotalUsers',jwtValidation,getTotalUsers);
router.post('/getTotalSellers',jwtValidation,getTotalSellers);
router.post('/getTotalSales',jwtValidation,getTotalSales);
router.post('/getOrderStats',jwtValidation,getOrderStats);






module.exports = router;
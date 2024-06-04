var express = require('express');
var router = express.Router();

router.use("/payment", require("./paymentRoutes"));


module.exports = router;

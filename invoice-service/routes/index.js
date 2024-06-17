var express = require('express');
var router = express.Router();

router.use("/invoice", require("./invoiceRoutes"));


module.exports = router;

var express = require('express');
var router = express.Router();

router.use("/offer", require("./offerRoutes"));


module.exports = router;

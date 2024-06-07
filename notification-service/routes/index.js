var express = require('express');
var router = express.Router();

router.use("/notification", require("./notificationRoutes"));


module.exports = router;

var express = require('express');
var router = express.Router();

router.use("/dashboard", require("./dashboardRoutes"));


module.exports = router;

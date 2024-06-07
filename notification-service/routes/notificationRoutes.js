const express = require('express');
const { jwtValidation } = require("model-hook/middleware/jwtValidation")

const router = express.Router();

const {getOneNotification,getAllNotification,removeNotification} = require('../controller/getNotification');



router.post('/getOneNotification',jwtValidation,getOneNotification);
router.post('/getAllNotification',jwtValidation,getAllNotification);
router.post('/removeNotification',jwtValidation,removeNotification);



module.exports = router;
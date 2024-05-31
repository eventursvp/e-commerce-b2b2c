const express = require("express");
const router = express.Router();
const { jwtValidation } = require("model-hook/middleware/jwtValidation");
const { registerUser,registerVendor } = require("../Controllers/userRegister");
const { loginUser,loginVendor } = require("../Controllers/loginUser");
const { verifyEmail ,verifyVendorEmail} = require("../Controllers/verifyEmail");
const { userProfile ,getSingleVendor} = require("../Controllers/userProfile");
const { updateUserProfile } = require("../Controllers/updateUserProfile");
const {updateVendor,updateBankDetail,updatePickupAddress} = require("../Controllers/updateVendorProfile")
const { changePassword ,changeVendorPassword} = require("../Controllers/changePassword");
const { forgetPassword,forgetVendorPassword } = require("../Controllers/forgetPassword");
const { resetPassword ,resetVendorPassword} = require("../Controllers/resetPassword");
const { getAllUser,getListOfVendors } = require("../Controllers/getAllUser");
const { logOutUser } = require("../Controllers/logOutUser");
const { deactiveUser } = require("../Controllers/deactiveUser");

const { enable2FA, sendOtp, verifyOtp, resendOtp,enableVendor2FA,sendVendorOtp,verifyVendorOtp,resendVendorOtp } = require("../Controllers/2FA")

const { addAddress } = require("../Controllers/userAddress/addAddress")
const { getOneAddress } = require("../Controllers/userAddress/getOneAddress")
const { getAllAddresses } = require("../Controllers/userAddress/getAllAddresses")
const { removeAddress } = require("../Controllers/userAddress/removeAddress")
const { setDefaultAddress } = require("../Controllers/userAddress/setDefaultAddress")
const { editAddress } = require("../Controllers/userAddress/editAddress")
const { getAuthLogs } = require("../Controllers/getAuthLogs")
const {rejectVendor,removeVendor,blockVendor} = require("../Controllers/rejectVendor")

router.post("/registerUser", registerUser);
router.get('/verifyEmail/:token', verifyEmail);
router.post("/loginUser", loginUser);
router.post("/userProfile", jwtValidation, userProfile);
router.post("/updateUserProfile", jwtValidation, updateUserProfile);
router.post("/changePassword", jwtValidation, changePassword);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword", resetPassword);
router.post("/logOutUser", jwtValidation, logOutUser);
router.post("/getAllUser", jwtValidation, getAllUser);
router.post("/deactiveUser", jwtValidation, deactiveUser);

router.post("/enable2FA", jwtValidation, enable2FA);
router.post("/sendOtp", jwtValidation, sendOtp);
router.post("/resendOtp", resendOtp)
router.post("/verifyOtp", verifyOtp);

router.post("/addAddress", jwtValidation, addAddress)
router.post("/getOneAddress", jwtValidation, getOneAddress)
router.post("/getAllAddresses", jwtValidation, getAllAddresses)
router.post("/removeAddress", jwtValidation, removeAddress)
router.post("/setDefaultAddress", jwtValidation, setDefaultAddress)
router.post("/editAddress", jwtValidation, editAddress)

router.post("/getAuthLogs", jwtValidation, getAuthLogs)


//vendor
router.post("/registerVendor", registerVendor);
router.get('/verifyVendorEmail/:token', verifyVendorEmail);
router.post("/loginVendor", loginVendor);

router.post("/enableVendor2FA", jwtValidation, enableVendor2FA);
router.post("/sendVendorOtp", jwtValidation, sendVendorOtp);
router.post("/resendVendorOtp", resendVendorOtp);
router.post("/verifyVendorOtp", verifyVendorOtp);

router.post("/changeVendorPassword", jwtValidation, changeVendorPassword);
router.post("/forgetVendorPassword", forgetVendorPassword);
router.post("/resetVendorPassword", resetVendorPassword);

router.post("/getListOfVendors", jwtValidation, getListOfVendors);
router.post("/updateVendor", jwtValidation, updateVendor);
router.post("/getSingleVendor", jwtValidation, getSingleVendor);

router.post("/rejectVendor", jwtValidation, rejectVendor);
router.post("/removeVendor", jwtValidation, removeVendor);
router.post("/blockVendor", jwtValidation, blockVendor);

router.post("/updateBankDetail", jwtValidation, updateBankDetail);
router.post("/updatePickupAddress", jwtValidation, updatePickupAddress);





module.exports = router;

const User = require('model-hook/Model/userModel')
const Vendor = require("model-hook/Model/vendorModel");
const mongoose = require('mongoose')
const { createApplicationLog } = require("model-hook/common_function/createLog")

exports.userProfile = async (req, res, next) => {
    try {
        const { userId } = req.body
        if (!userId) {
            return res.status(400).send({ status: 0, message: "User id is required." })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: 0, message: "Invalid user id." })
        }
        const { loginUser } = req
        if (userId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }
        const user = await User.findOne({ _id: userId }).select("firstName lastName email gender phoneNo is2FAEnabled")
        if (!user) {
            return res.status(404).send({ status: 0, message: "Empty set." })
        }
        await createApplicationLog("Auth", "user profile", {}, {}, loginUser?._id)
        return res.status(200).send({ status: 1, message: "User found.", data: user })
    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}


exports.getSingleVendor = async(req,res)=>{
    try {
        const{vendorId} = req.body

     if (!vendorId) {
            return res.status(400).send({ status: 0, message: "User id is required." })
        }
        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).send({ status: 0, message: "Invalid vendor id." })
        }
        const { loginUser } = req
        if (vendorId != loginUser?._id) {
            return res.status(401).send({ status: 0, message: "Unauthorized access as id." })
        }
        if (loginUser.role !== "Admin" && loginUser.role !== "Vendor") {
            return res.status(401).send({ status: 0, message: "Unauthorized access." });
        }
        
        const vendor = await Vendor.findOne({ _id: vendorId }).select("fullName email gender phoneNo is2FAEnabled")
        if (!vendor) {
            return res.status(404).send({ status: 0, message: "Empty set." })
        }
        await createApplicationLog("Auth", "vendor profile", {}, {}, loginUser?._id)
        return res.status(200).send({ status: 1, message: "User found.", data: vendor })
    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}
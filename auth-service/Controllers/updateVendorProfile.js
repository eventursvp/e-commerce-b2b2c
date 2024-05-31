const Vendor = require("model-hook/Model/vendorModel");
const mongoose = require('mongoose')
const { createApplicationLog } = require("model-hook/common_function/createLog")




exports.updateVendor = async (req, res, next) => {
    try {
        const { vendorId, fullName, gender } = req.body
        const { loginUser } = req
        if (!vendorId) {
            return res.status(400).send({ status: 0, message: "Vendor id is required." })
        }
        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).send({ status: 0, message: "Invalid user id." })
        }
        if (vendorId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }

        const obj = {}
        if (fullName) {
            if (!constants.nameRegex.test(fullName) || fullName.length > 25 || fullName.length < 5) {
                return res.status(400).send({ status: 0, message: "Invalid full name." })
            }
            obj.fullName = fullName
        }
        if (gender) {
            if (!['Male', 'Female', 'Other'].includes(gender)) {
                return res.status(400).send({ status: 0, message: "Please select valid gender." })
            }
            obj.gender = gender
        }

        const updateVendor = await Vendor.findOneAndUpdate({ _id: vendorId }, obj, { new: true })
        if (!updateVendor) {
            return res.status(500).send({ status: 0, message: "Vendor data not updated." })
        }
        await createApplicationLog(
            "Auth",
            "vendor profile updated",
            {
                fullName: loginUser?.fullName,
                gender: loginUser?.gender,
            },
            {
                fullName: updateVendor?.fullName,
                gender: updateVendor?.gender,
            },
            loginUser?._id)
        return res.status(201).send({ status: 1, message: "User data updated.", data: updateVendor })

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}


exports.updateBankDetail = async(req,res)=>{
    try {
        const {vendorId,accountHolderName,accountType,accountNo,reEnterAccountNo,bankName,ifsc} = req.body;

        const { loginUser } = req
        if (!vendorId) {
            return res.status(400).send({ status: 0, message: "Vendor id is required." })
        }
        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).send({ status: 0, message: "Invalid user id." })
        }
        if (vendorId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }

        if(!(accountHolderName || accountType || (accountNo && reEnterAccountNo) || bankName || ifsc)){
            return res.status(403).send({status:0,message:"All fields are required",data:[]})
        }

        if (accountNo !== reEnterAccountNo) {
            return res.status(400).send({ status: 0, message: "Account number and re-entered account number do not match." });
        }

        const data = await Vendor.findOneAndUpdate({_id:vendorId,isBlocked:false,isReject:false,isDeleted:false},{$set:{
            "bankDetails.accountHolderName":accountHolderName,
            "bankDetails.accountType":accountType,
            "bankDetails.accountNo":reEnterAccountNo,
            "bankDetails.reEnterAccountNo":reEnterAccountNo,
            "bankDetails.bankName":bankName,
            "bankDetails.ifsc":ifsc,

        }},{new:true});

        if(!data){
            return res.status(404).send({status:0,message:"Record not found",data:[]})
        }
        await createApplicationLog("Auth", "vendor update bankdetails", {}, {}, vendorId)
        return res.status(200).send({status:1,message:"Record updated successfull",data:data})
    } catch (error) {
        console.log("Catch Error:==>", error);
        return res.status(500).send({
            status: 0,
            message: "Internal Server Error",
            data: [],
        });
    }
}

exports.updatePickupAddress = async(req,res)=>{
    try {
        const {vendorId,pincode,address,city,state,} = req.body;

        const { loginUser } = req
        if (!vendorId) {
            return res.status(400).send({ status: 0, message: "Vendor id is required." })
        }
        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).send({ status: 0, message: "Invalid user id." })
        }
        if (vendorId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }

        if(!(pincode || address || city || state)){
            return res.status(403).send({status:0,message:"All fields are required",data:[]})
        }

        const data = await Vendor.findOneAndUpdate({_id:vendorId,isBlocked:false,isReject:false,isDeleted:false},{$set:{
            "pickupAddress.pincode":pincode,
            "pickupAddress.address":address,
            "pickupAddress.city":city,
            "pickupAddress.state":state

        }},{new:true});

        if(!data){
            return res.status(404).send({status:0,message:"Record not found",data:[]})
        }
        await createApplicationLog("Auth", "vendor update bankdetails", {}, {}, vendorId)
        return res.status(200).send({status:1,message:"Record updated successfull",data:data})
    } catch (error) {
        console.log("Catch Error:==>", error);
        return res.status(500).send({
            status: 0,
            message: "Internal Server Error",
            data: [],
        });
    }
}
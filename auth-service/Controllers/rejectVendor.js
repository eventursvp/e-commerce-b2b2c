const Vendor = require("model-hook/Model/vendorModel");
const mongoose = require("mongoose");
const { createApplicationLog } = require("model-hook/common_function/createLog")



exports.rejectVendor = async(req,res)=>{
    try {
        const {vendorId,adminId} = req.body

        const { loginUser } = req;
        if (loginUser._id != adminId) {
            return res.status(401).send({ message: "Unauthorized access."});
        }

        if (loginUser.role !== "Admin") {
            return res.status(401).send({ status: 0, message: "Unauthorized access." });
        }

        if(!(vendorId && adminId)){
            return res.status(403).send({status:0,message:"All fields are required",data:[]})
        }

        if(!(mongoose.Types.ObjectId.isValid(vendorId) && mongoose.Types.ObjectId.isValid(adminId))){
            return res.status(403).send({status:0,message:"Invalid request"})
        }

        const data = await Vendor.findOneAndUpdate({_id:vendorId,isReject:false},{$set:{isReject:true}},{new:true});
        
        if(!data){
            return res.status(404).send({status:0,message:"Record not found",data:[]})
        }
        await createApplicationLog("Auth", "vendor reject", {}, {}, adminId)
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


exports.removeVendor = async(req,res)=>{
    try {
        const {vendorId,adminId} = req.body

        const { loginUser } = req;
        if (loginUser._id != adminId) {
            return res.status(401).send({ message: "Unauthorized access."});
        }

        if (loginUser.role !== "Admin") {
            return res.status(401).send({ status: 0, message: "Unauthorized access." });
        }

        if(!(vendorId && adminId)){
            return res.status(403).send({status:0,message:"All fields are required",data:[]})
        }

        if(!(mongoose.Types.ObjectId.isValid(vendorId) && mongoose.Types.ObjectId.isValid(adminId))){
            return res.status(403).send({status:0,message:"Invalid request"})
        }

        const data = await Vendor.findOneAndUpdate({_id:vendorId,isDeleted:false},{$set:{isDeleted:true}},{new:true});
        
        if(!data){
            return res.status(404).send({status:0,message:"Record not found",data:[]})
        }
        await createApplicationLog("Auth", "vendor delete", {}, {}, adminId)
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


exports.blockVendor = async(req,res)=>{
    try {
        const {vendorId,adminId} = req.body

        const { loginUser } = req;
        if (loginUser._id != adminId) {
            return res.status(401).send({ message: "Unauthorized access."});
        }

        if (loginUser.role !== "Admin") {
            return res.status(401).send({ status: 0, message: "Unauthorized access." });
        }

        if(!(vendorId && adminId)){
            return res.status(403).send({status:0,message:"All fields are required",data:[]})
        }

        if(!(mongoose.Types.ObjectId.isValid(vendorId) && mongoose.Types.ObjectId.isValid(adminId))){
            return res.status(403).send({status:0,message:"Invalid request"})
        }

        const data = await Vendor.findOneAndUpdate({_id:vendorId,isBlocked:false},{$set:{isBlocked:true}},{new:true});
        
        if(!data){
            return res.status(404).send({status:0,message:"Record not found",data:[]})
        }
        await createApplicationLog("Auth", "vendor delete", {}, {}, adminId)
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
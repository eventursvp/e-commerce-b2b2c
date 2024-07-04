const mongoose = require("mongoose");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken")
const User = require("model-hook/Model/userModel")
const Vendor = require("model-hook/Model/vendorModel");
const UserOtp = require("model-hook/Model/userOtpModel")
const { constants } = require("model-hook/common_function/constants")
const { createApplicationLog } = require("model-hook/common_function/createLog")

function generateOtp() {
    const otp = parseInt(otpGenerator.generate(4, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false }));
    return otp;
}

exports.enable2FA = async (req, res, next) => {
    try {
        const { userId } = req.body
        const { loginUser } = req
        if (!userId) {
            return res.status(400).send({ status: 0, message: "User Id is required" });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: 0, message: "Invalid user id." })
        }
        if (userId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }
        if (loginUser?.phoneVerified === true && loginUser?.emailVerified === true) {
            const enable = loginUser?.is2FAEnabled === false ? true : false;
            const enable2Fa = await User.findByIdAndUpdate(userId, { $set: { is2FAEnabled: enable } }, { new: true })
            await createApplicationLog(
                "Auth",
                `2FA ${enable === true ? "Enabled" : "Disabled"}`,
                { is2FAEnabled: loginUser?.is2FAEnabled },
                { is2FAEnabled: enable2Fa?.is2FAEnabled },
                loginUser?._id)
            return res.status(201).send({ status: 1, message: `2FA ${enable === true ? "Enabled" : "Disabled"} successfully.`, data: enable2Fa })
        } else {
            return res.status(400).send({ status: 0, message: "Please verify your phone number." })
        }
    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}

exports.sendOtp = async (req, res, next) => {
    try {
        const { userId, phoneNo } = req.body;
        const { loginUser } = req

        if (!userId) {
            return res.status(400).send({ status: 0, message: "User Id is required" });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: 0, message: "Invalid user id." })
        }
        if (userId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }
        if (loginUser.is2FAEnabled) {
            return res.status(400).send({ status: 0, message: "2FA already enabled." })
        }
        if (loginUser?.emailVerified && loginUser?.phoneVerified) {
            return res.status(400).send({ status: 0, message: "Your phone verification already done. There for you can direct enable / disable 2FA authentication." })
        }
        if (!phoneNo) {
            return res.status(400).send({ status: 0, message: "Phone number is required." })
        }
        if (!constants.phoneNoRegex.test(phoneNo) || phoneNo.length < 10) {
            return res.status(400).send({ status: 0, message: "Invalid phone number." })
        }
        const checkPhoneNo = await User.findOne({ phoneNo: phoneNo, phoneVerified: true })
        if (checkPhoneNo) {
            return res.status(400).send({ status: 0, message: "This number is already used." })
        }
        const otp = generateOtp();
        // const otp = "0000"
        const alreadyExist = await UserOtp.findOne({ userId: userId, phoneNo: phoneNo })
        if (alreadyExist) {
            await UserOtp.findOneAndUpdate({ userId: userId, phoneNo: phoneNo }, { $set: { otp: otp, expirationTime: Date.now() + 30000 } }, { new: true });
        } else {
            await UserOtp.create({ userId: userId, phoneNo: phoneNo, otp: otp, expirationTime: Date.now() + 30000 })
        }
        const updateUser = await User.findByIdAndUpdate(userId, { $set: { phoneNo: phoneNo } }, { new: true })
        await createApplicationLog("Auth", "send otp", {}, {}, loginUser?._id)
        return res.status(201).send({ status: 1, message: "Otp send to your phone, Please verify.", otp })

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}

exports.resendOtp = async (req, res, next) => {
    try {
        const { phoneNo } = req.body
        // const { loginUser } = req
        if (!phoneNo) {
            return res.status(400).send({ status: 0, message: "Please enter phone number." })
        }
        if (!constants.phoneNoRegex.test(phoneNo) || phoneNo.length < 10) {
            return res.status(400).send({ status: 0, message: "Invalid phone number." })
        }
        // if (phoneNo !== loginUser?.phoneNo) {
        //     return res.status(400).send({ status: 0, message: "Please enter your registered phone number." })
        // }
        const otp = generateOtp()
        // const otp = "0000"
        const checkOtpAlreadySend = await UserOtp.findOne({ phoneNo: phoneNo })
        if (checkOtpAlreadySend) {
            const updateOtp = await UserOtp.findOneAndUpdate({ phoneNo: phoneNo }, { $set: { otp: otp, expirationTime: Date.now() + 30000 } }, { new: true })
            if (!updateOtp) {
                return res.status(500).send({ status: 0, message: "Otp not send to your phone." })
            }
            return res.status(201).send({ status: 1, message: "New Otp send to your phone", otp })
        } else {
            return res.status(400).send({ status: 0, message: "Invalid request." })
        }

    } catch (error) {
        console.log('error =>', error);
        return res.success({ status: 0, message: "Something went wrong.", error })
    }
}

exports.verifyOtp = async (req, res, next) => {
    try {
        const { phoneNo, otp } = req.body;
        // const { loginUser } = req
        if (!phoneNo) {
            return res.status(400).send({ status: 0, message: "Please enter phone number." })
        }
        if (!constants.phoneNoRegex.test(phoneNo) || phoneNo.length < 10) {
            return res.status(400).send({ status: 0, message: "Invalid phone number." })
        }
        // if (!userId) {
        //     return res.status(400).send({ status: 0, message: "User Id is required" });
        // }
        // if (!mongoose.isValidObjectId(userId)) {
        //     return res.status(400).send({ status: 0, message: "Invalid user id." })
        // }
        // if (userId != loginUser?._id) {
        //     return res.status(403).send({ status: 0, message: "Unauthorized access." })
        // }
        if (!otp) {
            return res.status(400).send({ status: 0, message: "Otp is required." })
        }
        // if (loginUser.phoneVerified) {
        //     return res.status(400).send({ status: 0, message: "Otp already verified." })
        // }
        const result = await UserOtp.findOne({ phoneNo: phoneNo })
        if (result) {
            const currentTime = Date.now()
            const expirationTime = result.expirationTime
            if (currentTime > expirationTime) {
                return res.status(200).send({ status: 0, message: "Otp is expired." })
            }
            if (result.otp === otp) {
                const checkUser = await User.findOne({ phoneNo: phoneNo })
                const enablePhoneVerified = await User.findByIdAndUpdate(checkUser?._id, { $set: { phoneVerified: true, phoneNo: result?.phoneNo } }, { new: true })
                const token = jwt.sign({ id: enablePhoneVerified._id, email: enablePhoneVerified.email, role: enablePhoneVerified.role }, process.env.JWT_TOKEN, { expiresIn: "1d" });
                await createApplicationLog("Auth", "verify otp", {}, {}, checkUser?._id)
                return res.status(201).send({ status: 1, message: "Otp verified successfully.", token: token })
            } else {
                return res.status(400).send({ status: 0, message: "Invalid otp." })
            }
        }
        return res.status(400).send({ status: 0, message: "Invalid request." })

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}

exports.enableVendor2FA = async (req, res, next) => {
    try {
        const { vendorId } = req.body
        const { loginUser } = req
        if (!vendorId) {
            return res.status(400).send({ status: 0, message: "Vendor Id is required" });
        }
        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).send({ status: 0, message: "Invalid user id." })
        }
        if (vendorId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }
        if (loginUser?.phoneVerified === true && loginUser?.emailVerified === true) {
            const enable = loginUser?.is2FAEnabled === false ? true : false;
            const enable2Fa = await Vendor.findOneAndUpdate({_id:vendorId,role:"Vendor"}, { $set: { is2FAEnabled: enable } }, { new: true })
            await createApplicationLog(
                "Auth",
                `2FA ${enable === true ? "Enabled" : "Disabled"}`,
                { is2FAEnabled: loginUser?.is2FAEnabled },
                { is2FAEnabled: enable2Fa?.is2FAEnabled },
                loginUser?._id)
            return res.status(201).send({ status: 1, message: `2FA ${enable === true ? "Enabled" : "Disabled"} successfully.`, data: enable2Fa })
        } else {
            return res.status(400).send({ status: 0, message: "Please verify your phone number." })
        }
    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}

exports.sendVendorOtp = async (req, res, next) => {
    try {
        const { vendorId, phoneNo } = req.body;
        const { loginUser } = req

        if (!vendorId) {
            return res.status(400).send({ status: 0, message: "Vendor Id is required" });
        }
        if (!mongoose.isValidObjectId(vendorId)) {
            return res.status(400).send({ status: 0, message: "Invalid vendor id." })
        }
        if (vendorId != loginUser?._id) {
            return res.status(403).send({ status: 0, message: "Unauthorized access." })
        }
        if (loginUser.is2FAEnabled) {
            return res.status(400).send({ status: 0, message: "2FA already enabled." })
        }
        if (loginUser?.emailVerified && loginUser?.phoneVerified) {
            return res.status(400).send({ status: 0, message: "Your phone verification already done. There for you can direct enable / disable 2FA authentication." })
        }
        if (!phoneNo) {
            return res.status(400).send({ status: 0, message: "Phone number is required." })
        }
        if (!constants.phoneNoRegex.test(phoneNo) || phoneNo.length < 10) {
            return res.status(400).send({ status: 0, message: "Invalid phone number." })
        }
        const checkPhoneNo = await Vendor.findOne({ mobile: phoneNo, phoneVerified: true,role:"Vendor" })
        if (checkPhoneNo) {
            return res.status(400).send({ status: 0, message: "This number is already used." })
        }
        const otp = generateOtp();
        // const otp = "0000"
        const alreadyExist = await UserOtp.findOne({ userId: vendorId, phoneNo: phoneNo })
        if (alreadyExist) {
            await UserOtp.findOneAndUpdate({ userId: vendorId, phoneNo: phoneNo }, { $set: { otp: otp, expirationTime: Date.now() + 30000 } }, { new: true });
        } else {
            await UserOtp.create({ userId: vendorId, phoneNo: phoneNo, otp: otp, expirationTime: Date.now() + 30000 })
        }
        const updateUser = await Vendor.findByIdAndUpdate(vendorId, { $set: { mobile: phoneNo } }, { new: true })
        await createApplicationLog("Auth", "send vendor otp", {}, {}, loginUser?._id)
        return res.status(201).send({ status: 1, message: "Otp send to your phone, Please verify.", otp })

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}

exports.resendVendorOtp = async (req, res, next) => {
    try {
        const { phoneNo } = req.body
        // const { loginUser } = req
        if (!phoneNo) {
            return res.status(400).send({ status: 0, message: "Please enter phone number." })
        }
        if (!constants.phoneNoRegex.test(phoneNo) || phoneNo.length < 10) {
            return res.status(400).send({ status: 0, message: "Invalid phone number." })
        }
        // if (phoneNo !== loginUser?.phoneNo) {
        //     return res.status(400).send({ status: 0, message: "Please enter your registered phone number." })
        // }
        const otp = generateOtp()
        // const otp = "0000"

        const vendorPhone = await Vendor.findOne({mobile:phoneNo});
        const checkOtpAlreadySend = await UserOtp.findOne({userId:vendorPhone._id, phoneNo: phoneNo })
        if (checkOtpAlreadySend) {
            const updateOtp = await UserOtp.findOneAndUpdate({userId:vendorPhone._id, phoneNo: phoneNo }, { $set: { otp: otp, expirationTime: Date.now() + 30000 } }, { new: true })
            if (!updateOtp) {
                return res.status(500).send({ status: 0, message: "Otp not send to your phone." })
            }
            return res.status(201).send({ status: 1, message: "New Otp send to your phone", otp })
        } else {
            return res.status(400).send({ status: 0, message: "Invalid request." })
        }

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong.", error })
    }
}

exports.verifyVendorOtp = async (req, res, next) => {
    try {
        const { phoneNo, otp } = req.body;
        // const { loginUser } = req
        if (!phoneNo) {
            return res.status(400).send({ status: 0, message: "Please enter phone number." })
        }
        if (!constants.phoneNoRegex.test(phoneNo) || phoneNo.length < 10) {
            return res.status(400).send({ status: 0, message: "Invalid phone number." })
        }
        // if (!userId) {
        //     return res.status(400).send({ status: 0, message: "User Id is required" });
        // }
        // if (!mongoose.isValidObjectId(userId)) {
        //     return res.status(400).send({ status: 0, message: "Invalid user id." })
        // }
        // if (userId != loginUser?._id) {
        //     return res.status(403).send({ status: 0, message: "Unauthorized access." })
        // }
        if (!otp) {
            return res.status(400).send({ status: 0, message: "Otp is required." })
        }
        // if (loginUser.phoneVerified) {
        //     return res.status(400).send({ status: 0, message: "Otp already verified." })
        // }

        const result = await UserOtp.findOne({ phoneNo: phoneNo })
        if (result) {
            const currentTime = Date.now()
            const expirationTime = result.expirationTime
            if (currentTime > expirationTime) {
                return res.status(200).send({ status: 0, message: "Otp is expired." })
            }
            if (result.otp === otp) {
                const vendorPhone = await Vendor.findOne({mobile:phoneNo});
                const checkVendor = await Vendor.findOne({_id:vendorPhone._id, mobile: phoneNo })
                const enablePhoneVerified = await Vendor.findByIdAndUpdate(checkVendor?._id, { $set: { phoneVerified: true, phoneNo: result?.phoneNo } }, { new: true })
                const token = jwt.sign({ id: enablePhoneVerified?._id, email: enablePhoneVerified.email, role: enablePhoneVerified.role }, process.env.JWT_TOKEN, { expiresIn: "1d" });
                await createApplicationLog("Auth", "verify vendor otp", {}, {}, checkVendor?._id)
                return res.status(201).send({ status: 1, message: "Otp verified successfully.", token: token })
            } else {
                return res.status(400).send({ status: 0, message: "Invalid otp." })
            }
        }
        return res.status(400).send({ status: 0, message: "Invalid request." })

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).send({ status: 0, message: "Something went wrong", error });
    }
}
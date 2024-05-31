const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Users = require("model-hook/Model/userModel")
const Vendor = require("model-hook/Model/vendorModel");
const hashPassword = require("model-hook/common_function/hashPassword");
const BlockListToken = require("model-hook/Model/blockListTokenModel");
const { createApplicationLog } = require("model-hook/common_function/createLog")

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body

        if (!token || !password) {
            return res.status(400).send({ status: 0, message: 'Token and password is required' });
        }
        const checkToken = await BlockListToken.findOne({ token: token });
        if (checkToken) {
            return res.status(400).send({ status: 0, message: 'Token is expired.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        if (decoded) {
            const user = await Users.findOne({ email: decoded.email.toLowerCase() })
            if (user) {
                if (user.password) {
                    const isSamePassword = await bcrypt.compare(password, user?.password);
                    if (isSamePassword) {
                        return res.status(500).send({ status: 0, message: 'Your new password should not be same as your current password.' });
                    }
                }
                const passwordHash = await hashPassword(password);
                const resetPassword = await Users.findByIdAndUpdate(user?.id, { password: passwordHash }, { new: true });
                if (resetPassword) {
                    const blockListToken = await BlockListToken.create({ token: token, userId: user._id });
                    await createApplicationLog("Auth", "reset password", {}, {}, user?._id)
                    return res.status(201).send({ status: 1, message: 'Password reset successfully' });
                }
                return res.status(500).send({ status: 0, message: 'Password not reset please try again' });
            }

        } else {
            return res.status(400).send({ status: 0, message: 'User Not found' });
        }

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).json({ status: 0, message: 'User Not found' });
    }
}

exports.resetVendorPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body

        if (!token || !password) {
            return res.status(400).send({ status: 0, message: 'Token and password is required' });
        }
        const checkToken = await BlockListToken.findOne({ token: token });
        if (checkToken) {
            return res.status(400).send({ status: 0, message: 'Token is expired.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        if (decoded) {
            const vendor = await Vendor.findOne({ email: decoded.email.toLowerCase() ,role:"Vendor"})
            if (vendor) {
                if (vendor.password) {
                    const isSamePassword = await bcrypt.compare(password, vendor?.password);
                    if (isSamePassword) {
                        return res.status(500).send({ status: 0, message: 'Your new password should not be same as your current password.' });
                    }
                }
                const passwordHash = await hashPassword(password);
                const resetPassword = await Vendor.findByIdAndUpdate(vendor?.id, { password: passwordHash }, { new: true });
                if (resetPassword) {
                    const blockListToken = await BlockListToken.create({ token: token, userId: vendor._id });
                    await createApplicationLog("Auth", "reset password", {}, {}, vendor?._id)
                    return res.status(201).send({ status: 1, message: 'Password reset successfully' });
                }
                return res.status(500).send({ status: 0, message: 'Password not reset please try again' });
            }

        } else {
            return res.status(400).send({ status: 0, message: 'User Not found' });
        }

    } catch (error) {
        console.log('error =>', error);
        return res.status(500).json({ status: 0, message: 'User Not found' });
    }
}
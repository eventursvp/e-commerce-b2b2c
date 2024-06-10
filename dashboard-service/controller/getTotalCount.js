const Order = require("model-hook/Model/orderModel");
const Vendor = require("model-hook/Model/vendorModel");
const User = require("model-hook/Model/userModel");
const mongoose = require("mongoose");
const moment = require("moment");

exports.getTotalCount = async (req, res) => {
    try {
        const {addedBy} = req.body;

        const { loginUser } = req;
        if (loginUser._id != addedBy) {
            return res.status(401).send({ message: "Unauthorized access."});
        }

        if (!(loginUser?.role === "Admin")) {
            return res.status(403).send({ status: 0, message: "Unauthorized access."});
        }

        if(!mongoose.Types.ObjectId.isValid(addedBy)){
            return res.status(403).send({
                status: 0,
                message: "Invalid request",
                data: [],
            });
        }

        const orderCount = await Order.countDocuments({ orderStatus: "DELIVERED" });
        const vendorCount = await Vendor.countDocuments({
            isBlocked: false,
            isDeleted: false,
            isReject: false,
        });
        const userCount = await User.countDocuments({ isLoggedOut: false });

        const data = {
            orderCount,
            vendorCount,
            userCount,
        };
        return res
            .status(200)
            .json({
                status: 1,
                message: "Record fetched successfully",
                data: data,
            });
    } catch (error) {
        console.log("Catch Error:==>", error);
        return res.status(500).send({
            status: 0,
            message: "Internal Server Error",
            data: [],
        });
    }
};

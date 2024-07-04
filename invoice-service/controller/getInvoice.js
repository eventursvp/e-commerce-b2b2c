const Invoice = require("model-hook/Model/invoiceModel");
const mongoose = require("mongoose");

exports.getOneInvoice = async (req, res) => {
    try {
        const { addedBy, invoiceId,userId } = req.body;

        const { loginUser } = req;
        if (!(loginUser._id != addedBy || loginUser._id != userId)) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if(addedBy && userId){
            return res.status(401).send({ message: "Add only one id." });
        }

        if(!(addedBy || userId)){
            return res.status(401).send({ message: "Add only one id." });
        }

        if (!(loginUser?.role === "Admin" || loginUser?.role === "Vendor" || loginUser?.role === "User")) {
            return res
                .status(403)
                .send({ status: 0, message: "Unauthorized access." });
        }

        if (
            !(
                mongoose.Types.ObjectId.isValid(addedBy) ||
                mongoose.Types.ObjectId.isValid(userId) &&
                mongoose.Types.ObjectId.isValid(invoiceId)
            )
        ) {
            return res.status(403).send({
                status: 0,
                message: "Invalid request",
                data: [],
            });
        }

        const aggregate = [
            {
                $match: {
                    $or:[
                        {
                            addedBy: new mongoose.Types.ObjectId(addedBy),
                        },
                        {
                            userId: new mongoose.Types.ObjectId(userId),
                        }
                    ],
                    _id: new mongoose.Types.ObjectId(invoiceId),
                },
            },
            {
                $lookup: {
                    from: "User",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$isLoggedOut", false] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                                lastName: 1,
                            },
                        },
                    ],
                    as: "userData",
                },
            },
            {
                $unwind: {
                    path: "$userData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "UserAddress",
                    let: { userId: "$userId", addressId: "$addressId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$addressId"] },
                                        { $eq: ["$userId", "$$userId"] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                address: 1,
                                area: 1,
                                landMark: 1,
                                pinCode: 1,
                                city: 1,
                                state: 1,
                                country: 1,
                            },
                        },
                    ],
                    as: "shippingAddressData",
                },
            },
            {
                $unwind: {
                    path: "$shippingAddressData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "Vendor",
                    let: { vendorId: "$addedBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$vendorId"] },
                                        { $eq: ["$isBlocked", false] },
                                        { $eq: ["$isReject", false] },
                                        { $eq: ["$isDeleted", false] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                pickupAddress: 1,
                                fullName: 1,
                            },
                        },
                    ],
                    as: "returnAddressData",
                },
            },
            {
                $unwind: {
                    path: "$returnAddressData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "Orders",
                    let: { orderId: "$orderId",userId:"$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$orderId"] },
                                    { $eq: ["$addedBy", "$$userId"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                orderNumber: 1,
                                price: 1,
                                quantity: 1,
                                productId: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                    as: "orderData",
                },
            },
            {
                $unwind: {
                    path: "$orderData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "Product",
                    let: { productId: "$orderData.productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$productId"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                            },
                        },
                    ],
                    as: "productData",
                },
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    userData: 1,
                    shippingAddressData: {
                        $cond:{
                            if:{$eq:["productData.addedBy",new mongoose.Types.ObjectId(addedBy)]},
                            then :addedBy,
                            else:"$shippingAddressData"
                        }
                    },
                    returnAddressData: 1,
                    orderData: 1,
                    productData: 1,
                },
            },
            // {
            //     $group: {
            //         _id: null,
            //         orderDetails: { $push: "$$ROOT" },
            //         totalAmount: {
            //             $sum: { $multiply: ["$price", "$quantity"] },
            //         },
            //     },
            // },
            // { $unset: ["_id"] }
        ];
        const data = await Invoice.aggregate(aggregate);

        if (!data || data.length === 0) {
            return res
                .status(404)
                .send({ status: 0, message: "Record not found", data: [] });
        }

        return res.status(200).send({
            status: 1,
            message: "Record fetched Successfull!",
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


exports.getAllInvoice = async (req, res) => {
    try {
        const { addedBy ,startDate,endDate} = req.body;

        const { loginUser } = req;
        if (loginUser._id != addedBy) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (!(loginUser?.role === "Admin" || loginUser?.role === "Vendor")) {
            return res
                .status(403)
                .send({ status: 0, message: "Unauthorized access." });
        }

        if (
            !(
                mongoose.Types.ObjectId.isValid(addedBy)
            )
        ) {
            return res.status(403).send({
                status: 0,
                message: "Invalid request",
                data: [],
            });
        }

        let query = { addedBy: new mongoose.Types.ObjectId(addedBy) };

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1);
            console.log("Diff==>",dayDiff);

            if (dayDiff != 7) {
                return res.status(400).send({
                    status: 0,
                    message: "Date range cannot exceed 7 days",
                    data: [],
                });
            }

            // Add date range to query
            query.createdAt = {
                $gte: start,
                $lte: end
            };
        }

        const aggregate = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "User",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$isLoggedOut", false] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                                lastName: 1,
                            },
                        },
                    ],
                    as: "userData",
                },
            },
            {
                $unwind: {
                    path: "$userData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "UserAddress",
                    let: { userId: "$userId", addressId: "$addressId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$addressId"] },
                                        { $eq: ["$userId", "$$userId"] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                address: 1,
                                area: 1,
                                landMark: 1,
                                pinCode: 1,
                                city: 1,
                                state: 1,
                                country: 1,
                            },
                        },
                    ],
                    as: "shippingAddressData",
                },
            },
            {
                $unwind: {
                    path: "$shippingAddressData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "Vendor",
                    let: { vendorId: "$addedBy" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$vendorId"] },
                                        { $eq: ["$isBlocked", false] },
                                        { $eq: ["$isReject", false] },
                                        { $eq: ["$isDeleted", false] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                pickupAddress: 1,
                                fullName: 1,
                            },
                        },
                    ],
                    as: "returnAddressData",
                },
            },
            {
                $unwind: {
                    path: "$returnAddressData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "Orders",
                    let: { orderId: "$orderId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$orderId"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                orderNumber: 1,
                                price: 1,
                                quantity: 1,
                                productId: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                    as: "orderData",
                },
            },
            {
                $unwind: {
                    path: "$orderData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "Product",
                    let: { productId: "$orderData.productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$productId"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                            },
                        },
                    ],
                    as: "productData",
                },
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    userData: 1,
                    shippingAddressData: {
                        $cond:{
                            if:{$eq:["productData.addedBy",new mongoose.Types.ObjectId(addedBy)]},
                            then :addedBy,
                            else:"$shippingAddressData"
                        }
                    },
                    returnAddressData: 1,
                    orderData: 1,
                    productData: 1,
                },
            },
            // {
            //     $group: {
            //         _id: null,
            //         orderDetails: { $push: "$$ROOT" },
            //         totalAmount: {
            //             $sum: { $multiply: ["$price", "$quantity"] },
            //         },
            //     },
            // },
            // { $unset: ["_id"] }
        ];
        const data = await Invoice.aggregate(aggregate);

        if (!data || data.length === 0) {
            return res
                .status(404)
                .send({ status: 0, message: "Record not found", data: [] });
        }

        return res.status(200).send({
            status: 1,
            message: "Record fetched Successfull!",
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
const Order = require("model-hook/Model/orderModel");
const Vendor = require("model-hook/Model/vendorModel");
const User = require("model-hook/Model/userModel");
const mongoose = require("mongoose");
const moment = require("moment");

exports.getTotalSales = async (req, res) => {
    try {
        let { startDate, endDate, monthWise, yearWise, year, addedBy } =
            req.body;

        const { loginUser } = req;
        if (loginUser._id != addedBy) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (!(loginUser?.role === "Vendor" || loginUser?.role === "Admin")) {
            return res
                .status(403)
                .send({ status: 0, message: "Unauthorized access." });
        }

        if (!mongoose.Types.ObjectId.isValid(addedBy)) {
            return res.status(403).send({
                status: 0,
                message: "Invalid request",
                data: [],
            });
        }

        let data;
        const monthsInString = [
            null,
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        if (!monthWise && !yearWise) {
            let a = moment(startDate);
            let b = moment(endDate);
            const Days = b.diff(a, "days") + 1;
            const OneDay = 1000 * 60 * 60 * 24,
                now = new Date(startDate),
                Today = now - (now % OneDay);
            endDate = moment(Today).add(Days, "days");
            let store = {};
            var thisDay = new Date(Today);
            while (thisDay < endDate) {
                store[new Date(thisDay)] = 0;
                thisDay = new Date(thisDay.valueOf() + OneDay);
            }
            let query = [
                {
                    $lookup: {
                        from: "Product",
                        let: { productId: "$productId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$productId"] },
                                            { $eq: ["$isDeleted", false] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "productData",
                    },
                },
                {
                    $match: {
                        orderStatus: "DELIVERED",
                        createdAt: {
                            $gte: new Date(now),
                            $lte: new Date(endDate),
                        },
                        "productData.addedBy": new mongoose.Types.ObjectId(
                            addedBy
                        ),
                    },
                },
                // {
                //     $addFields: {
                //         priceAdjusted: {
                //             $cond: [
                //                 { $eq: [{ $mod: ["$price", 10] }, 9] },
                //                 { $add: ["$price", 1] },
                //                 "$price"
                //             ]
                //         }
                //     }
                // },
                {
                    $group: {
                        _id: {
                            $add: [
                                {
                                    $subtract: [
                                        {
                                            $subtract: [
                                                "$createdAt",
                                                new Date(0),
                                            ],
                                        },
                                        {
                                            $mod: [
                                                {
                                                    $subtract: [
                                                        "$createdAt",
                                                        new Date(0),
                                                    ],
                                                },
                                                1000 * 60 * 60 * 24,
                                            ],
                                        },
                                    ],
                                },
                                new Date(0),
                            ],
                        },
                        totalSales: { $sum: /*"$priceAdjusted"*/ "$price" },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ];
            data = await Order.aggregate(query);
            let totalSales = 0;
            data.forEach(function (result) {
                totalSales += result.totalSales;
                store[new Date(result._id).toString()] = result.totalSales;
            });
            return res.status(200).send({
                status: 1,
                message: "Record fetched successfull",
                salesAnalytics: store,
                totalSales: totalSales,
            });
        } else {
            let date = new Date();
            if (yearWise) {
                date = new Date(year, 1, 1);
            }
            const yearStart = moment(date).startOf("year").toISOString();
            const yearEnd = moment(date).endOf("year").toISOString();

            let query = [
                {
                    $match: {
                        orderStatus: "DELIVERED",
                        createdAt: {
                            $gte: new Date(yearStart),
                            $lte: new Date(yearEnd),
                        },
                    },
                },
                {
                    $addFields: {
                        // priceAdjusted: {
                        //     $cond: [
                        //         { $eq: [{ $mod: ["$price", 10] }, 9] },
                        //         { $add: ["$price", 1] },
                        //         "$price"
                        //     ]
                        // },
                        month: {
                            $month: {
                                date: "$createdAt",
                                timezone: "Asia/Kolkata",
                            },
                        },
                        year: {
                            $year: {
                                date: "$createdAt",
                                timezone: "Asia/Kolkata",
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: { month: "$month", year: "$year" },
                        totalSales: { $sum: /*"$priceAdjusted"*/ "$price" },
                    },
                },
                {
                    $addFields: {
                        month: "$_id.month",
                        year: "$_id.year",
                    },
                },
                {
                    $addFields: {
                        monthInWords: {
                            $let: {
                                vars: {
                                    monthsInString: monthsInString,
                                },
                                in: {
                                    $arrayElemAt: [
                                        "$$monthsInString",
                                        "$month",
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $sort: {
                        month: 1,
                        year: 1,
                    },
                },
                {
                    $group: {
                        _id: null,
                        array: {
                            $push: {
                                k: "$monthInWords",
                                v: "$totalSales",
                            },
                        },
                        total: { $sum: "$totalSales" },
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: {
                            salesAnalytics: { $arrayToObject: "$array" },
                            totalSales: "$total",
                        },
                    },
                },
            ];

            data = await Order.aggregate(query);
            let salesAnalytics = {};
            // monthsInString.forEach((month, index) => {
            //     if (month !== null) {
            //         salesAnalytics[month] = 0;
            //     }
            // });
            if (data && data.length) {
                Object.assign(salesAnalytics, data[0].salesAnalytics);
            }

            return res.status(200).send({
                salesAnalytics: salesAnalytics,
                totalSales: data[0]?.totalSales || 0,
            });
        }
    } catch (error) {
        console.log("Catch Error:==>", error);
        return res.status(500).send({
            status: 0,
            message: "Internal Server Error",
            data: [],
        });
    }
};

exports.getOrderStats = async (req, res) => {
    try {
        let { period, addedBy } = req.body;

        const { loginUser } = req;
        if (loginUser._id != addedBy) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (!(loginUser?.role === "Admin" || loginUser?.role === "Vendor")) {
            return res
                .status(403)
                .send({ status: 0, message: "Unauthorized access." });
        }

        if (!mongoose.Types.ObjectId.isValid(addedBy)) {
            return res.status(403).send({
                status: 0,
                message: "Invalid request",
                data: [],
            });
        }

        let startDate, endDate, groupFormat, sortFormat;

        if (period === "today") {
            startDate = moment().startOf("day").toDate();
            endDate = moment().endOf("day").toDate();
            groupFormat = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
                hour: { $hour: "$createdAt" },
            };
            sortFormat = {
                "_id.year": 1,
                "_id.month": 1,
                "_id.day": 1,
                "_id.hour": 1,
            };
        } else if (period === "thisMonth") {
            startDate = moment().startOf("month").toDate();
            endDate = moment().endOf("month").toDate();
            groupFormat = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
            };
            sortFormat = {
                "_id.year": 1,
                "_id.month": 1,
                "_id.day": 1,
            };
        }else {
            return res.status(400).send({ status: 0, message: "Invalid period" });
        }

        let matchStage = {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        };

        let lookupStage = {
            $lookup: {
                from: "Product",
                let: { productId: "$productId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$productId"] },
                                    { $eq: ["$isDeleted", false] },
                                    { $eq: ["$addedBy", new mongoose.Types.ObjectId(addedBy)] },
                                ],
                            },
                        },
                    },
                ],
                as: "productData",
            },
        };

        let unwindStage = { $unwind: "$productData" };

        let groupStage = {
            $group: {
                _id: groupFormat,
                totalOrders: { $sum: 1 },
                totalRevenue: {
                    $sum: {
                        $cond: {
                            if: { $regexMatch: { input: { $toString: "$price" }, regex: /9$/ } },
                            then: { $add: ["$price", 1] },
                            else: "$price",
                        },
                    },
                },
                cancelledOrders: {
                    $sum: {
                        $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 1, 0],
                    },
                },
            },
        };

        let sortStage = { $sort: sortFormat };

        let data = await Order.aggregate([
            matchStage,
            lookupStage,
            unwindStage,
            groupStage,
            sortStage,
        ]);

        let stats = {};
        let totalOrders = 0;
        // let totalRevenue = 0;
        let cancelledOrders = 0;

        if (period === "today") {
            for (let i = 0; i < 24; i++) {
                stats[moment().startOf("day").add(i, "hours").format("HH:00")] = {
                    orders: 0,
                    // revenue: 0,
                    cancelled: 0,
                };
            }
        } else if (period === "thisMonth") {
            let daysInMonth = moment().daysInMonth();
            for (let i = 1; i <= daysInMonth; i++) {
                stats[moment().startOf("month").add(i - 1, "days").format("DD MMM")] = {
                    orders: 0,
                    // revenue: 0,
                    cancelled: 0,
                };
            }
        }

        data.forEach((item) => {
            let key;
            if (period === "today") {
                key = moment({
                    year: item._id.year,
                    month: item._id.month - 1,
                    day: item._id.day,
                    hour: item._id.hour,
                }).format("HH:00");
            } else if (period === "thisMonth") {
                key = moment({
                    year: item._id.year,
                    month: item._id.month - 1,
                    day: item._id.day,
                }).format("DD MMM");
            }

            stats[key] = {
                orders: item.totalOrders,
                // revenue: item.totalRevenue,
                cancelled: item.cancelledOrders,
            };
            totalOrders += item.totalOrders;
            // totalRevenue += item.totalRevenue;
            cancelledOrders += item.cancelledOrders;
        });

        return res.status(200).send({
            status: 1,
            message: "Record fetched successfully",
            data: stats,
            // totalOrders: totalOrders,
            // totalRevenue: totalRevenue,
            // cancelledOrders: cancelledOrders,
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
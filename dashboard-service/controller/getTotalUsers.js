const Order = require("model-hook/Model/orderModel");
const Vendor = require("model-hook/Model/vendorModel");
const User = require("model-hook/Model/userModel");
const mongoose = require("mongoose");
const moment = require("moment");

exports.getTotalUsers = async (req, res) => {
    try {
        let { startDate, endDate, monthWise, yearWise, year, addedBy } =
            req.body;

        const { loginUser } = req;
        if (loginUser._id != addedBy) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (!(loginUser?.role === "Vendor")) {
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
            null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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
                    $match: {
                        isLoggedOut: false,
                        createdAt: {
                            $gte: new Date(now),
                            $lte: new Date(endDate),
                        },
                    },
                },
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
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ];
            data = await User.aggregate(query);
            let totalUsers = 0;
            data.forEach(function (result) {
                totalUsers += result.count;
                store[new Date(result._id).toString()] = result.count;
            });
            return res
                .status(200)
                .send({ userrAnalytics: store, totalUsers: totalUsers });
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
                        createdAt: {
                            $gte: new Date(yearStart),
                            $lte: new Date(yearEnd),
                        },
                    },
                },
                {
                    $addFields: {
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
                        users: { $sum: 1 },
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
                                    monthsInString:monthsInString
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
                                v: "$users",
                            },
                        },
                        total: { $sum: "$users" },
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: {
                            userrAnalytics: { $arrayToObject: "$array" },
                            totalUsers: "$total",
                        },
                    },
                },
            ];
            data = await User.aggregate(query);
            let userrAnalytics = {};
            // monthsInString.forEach((month, index) => {
            //     if (month !== null) {
            //         userrAnalytics[month] = 0;
            //     }
            // });

            if (data && data.length) {
                Object.assign(userrAnalytics, data[0].userrAnalytics);
            }
            return res
            .status(200)
            .send(
                data && data.length
                    ? data[0]
                    : { userrAnalytics: {}, totalUsers: 0 }
            );
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

const Notification = require("model-hook/Model/notificationModel");
const mongoose = require("mongoose");
const {
    createApplicationLog,
} = require("model-hook/common_function/createLog");

exports.getOneNotification = async (req, res) => {
    try {
        const { userId, notificationId } = req.body;

        if (
            Object.keys(req.body).length !== 2 ||
            !(req.body.userId && req.body.notificationId)
        ) {
            return res
                .status(400)
                .send({
                    status: 0,
                    message:
                        "Invalid request. Only userid and notificationid allowed in the request body.",
                    data: [],
                });
        }

        const { loginUser } = req;
        if (loginUser._id != userId) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (
            !(
                mongoose.Types.ObjectId.isValid(userId) &&
                mongoose.Types.ObjectId.isValid(notificationId)
            )
        ) {
            return res
                .status(403)
                .send({ status: 0, message: "Invalid request", data: [] });
        }

        const data = await Notification.findOne({ _id: notificationId });

        if (!data) {
            return res.status(404).send({
                status: 0,
                error: "Record not found",
                data: [],
            });
        }

        if (data.isRead !== true) {
            const data = await Notification.findOneAndUpdate(
                { _id: notificationId, isRead: false },
                { $set: { isRead: true } },
                { new: true }
            );

            return res.status(200).send({
                status: 1,
                message: "Record Fetched Successfully!",
                data: data,
            });
        }
        await createApplicationLog(
            "Notification",
            "view one notification",
            {},
            {},
            userId
        );

        return res.status(200).send({
            status: 1,
            message: "Record Fetched Successfully!",
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

exports.getAllNotification = async (req, res) => {
    try {
        const { userId } = req.body;

        if (Object.keys(req.body).length !== 1 || !req.body.userId) {
            return res
                .status(400)
                .send({
                    status: 0,
                    message:
                        "Invalid request. Only userId is allowed in the request body.",
                    data: [],
                });
        }

        const { loginUser } = req;
        if (loginUser._id != userId) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res
                .status(403)
                .send({ status: 0, message: "Invalid request", data: [] });
        }

        const data = await Notification.find({ userId: userId });

        if (!data || data.length === 0) {
            return res.status(404).send({
                status: 0,
                error: "Record not found",
                data: [],
            });
        }

        await createApplicationLog(
            "Notification",
            "view All notification",
            {},
            {},
            userId
        );

        return res.status(200).send({
            status: 1,
            message: "Record Fetched Successfully!",
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

exports.removeNotification = async (req, res) => {
    try {
        const { userId, notificationId } = req.body;

        if (
            Object.keys(req.body).length !== 2 ||
            !(req.body.userId && req.body.notificationId)
        ) {
            return res
                .status(400)
                .send({
                    status: 0,
                    message:
                        "Invalid request. Only userid and notificationid allowed in the request body.",
                    data: [],
                });
        }

        const { loginUser } = req;
        if (loginUser._id != userId) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (
            !(
                mongoose.Types.ObjectId.isValid(userId) &&
                mongoose.Types.ObjectId.isValid(notificationId)
            )
        ) {
            return res
                .status(403)
                .send({ status: 0, message: "Invalid request", data: [] });
        }

        const data = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: userId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!data) {
            return res.status(404).send({
                status: 0,
                error: "Record not found",
                data: [],
            });
        }

        return res
            .status(200)
            .send({ status: 1, message: "Record deleted successfully" });
    } catch (error) {
        console.log("Catch Error:==>", error);
        return res.status(500).send({
            status: 0,
            message: "Internal Server Error",
            data: [],
        });
    }
};

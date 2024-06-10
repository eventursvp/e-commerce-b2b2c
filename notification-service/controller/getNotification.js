const Notification = require("model-hook/Model/notificationModel");
const mongoose = require("mongoose");
const {
    createApplicationLog,
} = require("model-hook/common_function/createLog");

exports.getOneNotification = async (req, res) => {
    try {
        const { receiverId, notificationId } = req.body;

        if (
            Object.keys(req.body).length !== 2 ||
            !(req.body.receiverId && req.body.notificationId)
        ) {
            return res
                .status(400)
                .send({
                    status: 0,
                    message:
                        "Invalid request. Only receiverId and notificationid allowed in the request body.",
                    data: [],
                });
        }

        const { loginUser } = req;
        if (loginUser._id != receiverId) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (
            !(
                mongoose.Types.ObjectId.isValid(receiverId) &&
                mongoose.Types.ObjectId.isValid(notificationId)
            )
        ) {
            return res
                .status(403)
                .send({ status: 0, message: "Invalid request", data: [] });
        }

        const data = await Notification.findOne({ _id: notificationId,receiverId:new mongoose.Types.ObjectId(receiverId) });

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
            receiverId
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
        const { receiverId } = req.body;

        if (Object.keys(req.body).length !== 1 || !req.body.receiverId) {
            return res
                .status(400)
                .send({
                    status: 0,
                    message:
                        "Invalid request. Only receiverId is allowed in the request body.",
                    data: [],
                });
        }

        const { loginUser } = req;
        if (loginUser._id != receiverId) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res
                .status(403)
                .send({ status: 0, message: "Invalid request", data: [] });
        }

        const data = await Notification.find({ receiverId: new mongoose.Types.ObjectId(receiverId) });

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
            receiverId
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
        const { receiverId, notificationId } = req.body;

        if (
            Object.keys(req.body).length !== 2 ||
            !(req.body.receiverId && req.body.notificationId)
        ) {
            return res
                .status(400)
                .send({
                    status: 0,
                    message:
                        "Invalid request. Only receiverId and notificationid allowed in the request body.",
                    data: [],
                });
        }

        const { loginUser } = req;
        if (loginUser._id != receiverId) {
            return res.status(401).send({ message: "Unauthorized access." });
        }

        if (
            !(
                mongoose.Types.ObjectId.isValid(receiverId) &&
                mongoose.Types.ObjectId.isValid(notificationId)
            )
        ) {
            return res
                .status(403)
                .send({ status: 0, message: "Invalid request", data: [] });
        }

        const data = await Notification.findOneAndUpdate(
            { _id: notificationId, receiverId: new mongoose.Types.ObjectId(receiverId), isDeleted: false },
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

        await createApplicationLog(
            "Notification",
            "remove notification",
            {},
            {},
            receiverId
        );

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

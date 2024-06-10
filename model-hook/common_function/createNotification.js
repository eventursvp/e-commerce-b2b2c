// const Notification = require("../Models/Notification")

// async function createNotification(title, mainEventId, message, receiverId, senderId) {
//     const createNotification = await Notification.create({
//         title,
//         message,
//         receiverId: receiverId || null,
//         senderId,
//         read: false
//     })
// }

// module.exports = createNotification;


const Notification = require("../Model/notificationModel")
exports.createNotification = async (senderId, receiverId,type, subType, title, message ) => {
    try {
        const newNotification = new Notification({
            senderId,
            type,
            subType,
            title,
            message,
            receiverId
        });
        await newNotification.save();
        console.log('Notification created');
    } catch (error) {
        console.error('Error adding notification:', error);
    }
};
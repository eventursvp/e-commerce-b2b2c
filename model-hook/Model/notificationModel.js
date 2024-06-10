const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    senderId: {
        type: Schema.Types.Mixed,
      },
    receiverId: {
        type: Schema.Types.Mixed,
    },
    type: {
        type: String,
        enum: ['Order', 'Product', 'Account', 'Promotional', 'Vendor', 'System'],
        required: true
    },
    subType: {
        type: String,
        required: true,
        enum: [
            'OrderPlaced', 'OrderShipped', 'OrderDelivered', 'OrderCancelled', 'OrderReturned',
            'OrderCreate','UpdateStatus',
            'BackInStock', 'NewProductLaunch','AccountCreated', 'PasswordChanged', 
            'AccountSuspended', 'AccountReinstated',
            'NewOffers', 'SeasonalSales', 'PersonalizedRecommendations',
            'NewOrderReceived', 'ProductReviewReceived', 'PaymentProcessed', 'AccountVerificationRequired',
            'SystemMaintenance', 'PolicyUpdates', 'SecurityAlerts'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
},
{
    timestamps: true
});

const Notification = mongoose.model('Notification', NotificationSchema ,'Notification');

module.exports = Notification;

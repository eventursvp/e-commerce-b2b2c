const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Vendor = new Schema({
    fullName: {
        type: String
    },
    companyName: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String
    },
    gstNo: {
        type: String
    },
    idProof: {
        adharCardFront: { type: String },
        adharCardBack: { type: String },
        addressProof: { type: String },
    },
    pickupAddress: {
        pincode: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
    },
    role: {
        type: String,
        default:'Vendor'
    },
    bankDetails: {
        accountHolderName: { type: String },
        accountType: { type: String },
        accountNo: { type: String },
        reEnterAccountNo: { type: String },

        bankName: { type: String },
        ifsc: { type: String },

    },
    isBlocked: { type: Boolean, default: false },
    isReject: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    is2FAEnabled: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

}, {
    timestamps: true
});

module.exports = mongoose.model('Vendor', Vendor,'Vendor');




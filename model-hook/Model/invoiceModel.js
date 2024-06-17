const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Invoice = new Schema({
    addressId: { type: Schema.ObjectId, ref: 'UserAddress' },
    orderId: { type: Schema.ObjectId, ref: 'Orders' },
    userId: { type: Schema.ObjectId, ref: 'User' },
    addedBy: { type: Schema.ObjectId},
    isDeleted: { type: Boolean, default: false },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Invoice', Invoice,'Invoice');
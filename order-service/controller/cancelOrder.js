const Order = require("model-hook/Model/orderModel");
const User = require("model-hook/Model/userModel");
const Product = require("model-hook/Model/productModel");
const Cart = require("model-hook/Model/cartModel");
const UserAddress = require("model-hook/Model/userAddressModel");
const Invoice = require("model-hook/Model/invoiceModel");
const mongoose = require('mongoose');
const {createNotification} = require("model-hook/common_function/createNotification");
const { createApplicationLog } = require("model-hook/common_function/createLog");


exports.cancelOrder = async (req, res) => {
    try {
        const { orderId ,addedBy} = req.body;

        const { loginUser } = req;
        if (loginUser._id != addedBy) {
            return res.status(401).send({ message: "Unauthorized access."});
        }

        if (!(loginUser?.role === "User")) {
            return res.status(403).send({ status: 0, message: "Unauthorized access."});
        }

        if ( !(mongoose.Types.ObjectId.isValid(addedBy) && mongoose.Types.ObjectId.isValid(orderId)) )
            {
               return res.status(403).send({
                   status: 0,
                   message: "Invalid request",
                   data: [],
               });
           }
        const order = await Order.findOne({_id:orderId,addedBy:addedBy});
        if (!order) {
            return res.status(404).json({ status: 0, message: 'Order not found' });
        }

        const productData = await Product.findOne({_id:order.productId});

        if (order.orderStatus === 'CANCELLED' || order.orderStatus === 'DELIVERED' || order.orderStatus === 'RETURN') {
            return res.status(400).send({ status: 0, message: 'Order cannot be cancelled',data:[] });
        }

        order.orderStatus = 'CANCELLED';
        await order.save();

        const addressData = await UserAddress.findOne({userId:addedBy});

        if(!addressData){
            return res.status(404).send({
                status: 0,
                message: "Address not available",
                data: [],
            });
        }
        const invoice = {
            addressId:addressData._id,
            orderId:order._id,
            userId:order.addedBy,
            addedBy:productData.addedBy
        }

        const invoiceData = await new Invoice(invoice).save();

        if (!invoiceData) {
            return res.status(403).send({
                status: 0,
                message: "Invoice not create",
                data: [],
            });
        }
        await createNotification(order.addedBy,productData.addedBy,"Order","OrderCancelled","Order cancelled","Order cancelled Successfully");
        await createApplicationLog("Order", "order cancelled", {}, {}, addedBy);

        return res.status(200).json({ status: 1, message: 'Order cancelled successfully'});
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
    }
};

const Order = require("model-hook/Model/orderModel");
const User = require("model-hook/Model/userModel");
const Product = require("model-hook/Model/productModel");
const Cart = require("model-hook/Model/cartModel");
const mongoose = require('mongoose');
const {createNotification} = require("model-hook/common_function/createNotification");
const { createApplicationLog } = require("model-hook/common_function/createLog");


exports.updateStatus = async (req, res) => {
    try {
        const { orderId ,addedBy,status} = req.body;

        const { loginUser } = req;
        if (loginUser._id != addedBy) {
            return res.status(401).send({ message: "Unauthorized access."});
        }

        if ( !(mongoose.Types.ObjectId.isValid(addedBy) && mongoose.Types.ObjectId.isValid(orderId)) )
            {
               return res.status(403).send({
                   status: 0,
                   message: "Invalid request",
                   data: [],
               });
           }

           const validStatuses = ['PROCESSING', 'SHIPPED', 'UNSHIPPED', 'DISPATCHED',"PACKED","PROCESSING","FAILED","REFUND","EXCHANGE"];
           if (!validStatuses.includes(status)) {
             return res.status(400).send({status:0,message:'Invalid order status',data:[]});
           }

        const order = await Order.findOne({_id:orderId});
        if (!order) {
            return res.status(404).json({ status: 0, message: 'Order not found' });
        }

        const productData = await Product.findOne({_id:order.productId});

        // if (order.orderStatus === 'CANCELLED' || order.orderStatus === 'COMPLETED' || order.orderStatus === 'RETURN') {
        //     return res.status(400).send({ status: 0, message: 'Order cannot be cancelled',data:[] });
        // }

        order.orderStatus = status;
        await order.save();
        await createNotification(order.addedBy,productData.addedBy,"Order","UpdateStatus","Order status update","Order status  Successfully");
        await createApplicationLog("Order", "update order status", {}, {}, addedBy);

        return res.status(200).json({ status: 1, message: 'Order status updated successfully'});
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ status: 0, message: 'Internal Server Error' });
    }
};

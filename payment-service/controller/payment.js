const Payment = require("model-hook/Model/paymentModel");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const RAZORPAY_API_KEY = "bjiwauhejfgewo78y9eyqwuihY8"
const RAZORPAY_APT_SECRET = "JWJKDBWBFIURFQIU34F"

const instance = new Razorpay({
  key_id: RAZORPAY_API_KEY,
  key_secret: RAZORPAY_APT_SECRET,
  
});

exports.checkout = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(400).json({
        status: 0,
        message: "order not created",
      });
    }

    return res.status(200).json({
      status: 1,
      message: "order created successfully",
      data: order,
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

exports.paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Database comes here
    
        await new Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });
    
        // res.redirect(
        //   `http://localhost:5000/paymentsuccess?reference=${razorpay_payment_id}`
        // );
      } else {
        res.status(400).json({
          success: false,
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

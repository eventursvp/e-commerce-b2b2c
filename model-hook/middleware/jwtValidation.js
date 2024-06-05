const jwt = require('jsonwebtoken');
const User = require('../Model/userModel');
const Vendor = require("../Model/vendorModel");
const Admin = require("../Model/adminModel");

// exports.jwtValidation = async (req, res, next) => {
//     try {
//         const token = req.headers['x-access-token'];
//         if (token) {
//             jwt.verify(token, process.env.JWT_TOKEN, async function (error, decoded) {
//                 if (error) {
//                     return res.status(401).send({
//                         status: 0,
//                         isAuthenticated: false,
//                         message: "Session expired. Please Login again."
//                     });
//                 } else if (!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('id') || !decoded.hasOwnProperty('role')) {
//                     return res.status(400).send({ status: 0, message: "Invalid token" })
//                 }
//                 else {
//                     let findUser = await User.findOne({ email: decoded.email.toLowerCase() });

//                     let findVendor = await Vendor.findOne({ email: decoded.email.toLowerCase() });

//                     if (findUser) {
//                         if (findUser.role !== "Admin") {
//                             if (findUser.isLoggedOut === true) {
//                                 return res.status(401).send({ status: 0, message: "Please Login Again" })
//                             } else if (findUser.emailVerified === false) {
//                                 return res.status(401).send({ status: 0, message: "Please verify your email" })
//                             }
//                         }
//                         req.loginUser = findUser;
//                         next();
//                     } else if(findVendor){
//                         if (findVendor.role !== "Admin") {
//                             if (findVendor.isLoggedOut === true) {
//                                 return res.status(401).send({ status: 0, message: "Please Login Again" })
//                             } else if (findVendor.emailVerified === false) {
//                                 return res.status(401).send({ status: 0, message: "Please verify your email" })
//                             }
//                         }
//                         req.loginUser = findVendor;
//                         next();
//                     } else {
//                         return res.status(401).send({ status: 0, message: "Unauthorized access." })
//                     }
//                 }
//             });
//         } else {
//             return res.status(400).send({ message: "Please provide valid token." })
//         }
//     }
//     catch (error) {
//         console.log(error);
//         return res.send({ status: 0, message: "Something went wrong.", error });
//     }
// }

exports.jwtValidation = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        if (!token) {
            return res.status(400).send({ message: "Please provide a valid token." });
        }

        jwt.verify(token, process.env.JWT_TOKEN, async (error, decoded) => {
            if (error) {
                return res.status(401).send({
                    status: 0,
                    isAuthenticated: false,
                    message: "Session expired. Please log in again."
                });
            }

            if (!decoded || !decoded.email || !decoded.id || !decoded.role) {
                return res.status(400).send({ status: 0, message: "Invalid token" });
            }

            const email = decoded.email.toLowerCase();
            let user = await User.findOne({ email });
            let vendor = await Vendor.findOne({ email });
            let admin = await Admin.findOne({ email });

            const foundUser = user || vendor || admin;

            if (!foundUser) {
                return res.status(401).send({ status: 0, message: "Unauthorized access." });
            }

            if(user && user.role === "User"){
                if (user.isLoggedOut) {
                    return res.status(401).send({ status: 0, message: "Please log in again." });
                }
                if (!user.emailVerified) {
                    return res.status(401).send({ status: 0, message: "Please verify your email." });
                }
            }else if(vendor && vendor.role === "Vendor"){
                if (vendor.isLoggedOut) {
                    return res.status(401).send({ status: 0, message: "Please log in again." });
                }
                if (!vendor.emailVerified) {
                    return res.status(401).send({ status: 0, message: "Please verify your email." });
                }
                if (vendor.isBlocked) {
                    return res.status(401).send({ status: 0, message: "Your account has been blocked." });
                }
                if (vendor.isReject) {
                    return res.status(401).send({ status: 0, message: "Your account has been rejected." });
                }
            }else if( admin && admin.role === "Admin"){
                if (admin.isLoggedOut) {
                    return res.status(401).send({ status: 0, message: "Please log in again." });
                }
            }else{
                return res.status(401).send({ status: 0, message: "user not found." });
            }

            req.loginUser = foundUser;
            next();
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: 0, message: "Something went wrong.", error });
    }
};

const mongoose = require("mongoose");
require("dotenv").config();


mongoose.set("strictQuery", false);


const DB_URL =
    "mongodb+srv://eventu:39lzaVMNq8bO8m3V@cluster0.pdxma2k.mongodb.net/E-Commerce-B2B2C";

if (!DB_URL) {
    console.error("Database URL is not defined.");
    process.exit(1); // Exit with error
}

// Connect to MongoDB
mongoose
    .connect(DB_URL)
    .then(() => {
        console.log("Database Connected Successfully!");
    })
    .catch((err) => {
        console.error("Error in Connecting Database:", err);
        process.exit(1); // Exit with error
    });

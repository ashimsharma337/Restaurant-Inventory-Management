const mongoose = require("mongoose");
const DATABASE = "mongodb://localhost:27017/inventoryManagement";

mongoose.connect(DATABASE, (err, success) => {
    if(err){
        console.log("Error connecting database", err);
    } else {
        console.log("Database connection successfull..");
    }
})
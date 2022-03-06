const mongoose = require("mongoose");
const DATABASE = process.env.DATABASE;

mongoose.connect(DATABASE, (err, success) => {
    if(err){
        console.log("Error connecting database", err);
    } else {
        console.log("Database connection successfull..");
    }
})
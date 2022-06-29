const mongoose = require("mongoose");

mongoose.connect("Your mongo atlas url...")
.then(() => {
    console.log("Database connection successfull..");
})     
.catch((err) => {
    console.log("Error connecting database", err);
})
  

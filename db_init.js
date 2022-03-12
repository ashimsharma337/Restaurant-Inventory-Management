const mongoose = require("mongoose");

mongoose.connect("Your db url")
.then(() => {
    console.log("Database connection successfull..");
})
.catch((err) => {
    console.log("Error connecting database", err);
})
  

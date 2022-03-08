const mongoose = require("mongoose");

mongoose.connect("YOUR_MONGODB_URI")
.then(() => {
    console.log("Database connection successfull..");
})
.catch((err) => {
    console.log("Error connecting database", err);
})
  

const mongoose = require("mongoose");
const DBurl = process.env.MONGOURL;

mongoose.connect(DBurl)
.then(() => {
    console.log("Database connection successfull..");
})     
.catch((err) => {
    console.log("Error connecting database", err);
})
  

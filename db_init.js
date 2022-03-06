const mongoose = require("mongoose");
require("dotenv").config();
const DATABASE = process.env.DATABASE;

mongoose.connect(DATABASE)
.then(() => {
    console.log("Database connection successfull..");
})
.catch((err) => {
    console.log("Error connecting database", err);
})
  
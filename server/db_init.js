const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://ashim:ashimsharma@cluster0.6ktkn.mongodb.net/mern-class-project?retryWrites=true&w=majority")
.then(() => {
    console.log("Database connection successfull..");
})     
.catch((err) => {
    console.log("Error connecting database", err);
})
  
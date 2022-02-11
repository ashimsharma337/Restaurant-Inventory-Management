const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
        enum: ["general-manager", "kitchen-manager", "supervisor"],
        default: "supervisor"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive" 
    },
    restaurantName: {
        type: String,
        required: true
    }
},  {
    timeStamps: true
});

const User = mongoose.model("User", UserSchema);

module.exports = User;


const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
    OrderItem: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        default: null
    },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
},  {
    timeStamps: true
});

module.exports = mongoose.model("OrderItem", OrderItemSchema);

const OrderTableSchema = new mongoose.Schema({
    items: [OrderItemSchema],
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        default: null
    },
    created: {
        type: Date,
        default: Date.now()
    }
}, {
    timeStamps: true
});



module.exports = mongoose.model("OrderTable", OrderTableSchema);


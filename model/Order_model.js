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

const OrderItem = mongoose.model("OrderItem", OrderItemSchema);

const OrderTableSchema = new mongoose.Schema({
    items: [OrderItem],
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


const OrderTable = mongoose.model("OrderTable", OrderTableSchema);


const Order = {
    
      orderItem: OrderItem,
      orderTable: OrderTable,
}

module.exports = Order;


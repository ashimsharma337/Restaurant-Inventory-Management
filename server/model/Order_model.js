const mongoose = require("mongoose");

const OrderTableSchema = new mongoose.Schema({
    items: [],
    created: {
        type: Date,
        default: Date.now()
    }
}, {
    timeStamps: true
});




const OrderItem = mongoose.model("OrderTable", OrderTableSchema);
module.exports = OrderItem;




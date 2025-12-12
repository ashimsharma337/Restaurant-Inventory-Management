const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category_id: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        default: null
    },
    vendor: {
        type: String,
        required: true
    },
    vendorInfo: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    parLevel: {
        type: Number,
        required: true
    },
    image: [String]
},  {
    timestamps: true
});


const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
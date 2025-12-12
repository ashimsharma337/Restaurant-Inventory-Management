const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    parent_id: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        default: null
    }
    },{
        timestamps: true
    });

    const Category = mongoose.model("Category", CategorySchema);

    module.exports = Category;
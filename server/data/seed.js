require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User_model");
const Product = require("../models/Product_model");
const Category = require("../models/Category_model");
const OrderTable = require("../models/Order_model");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await OrderTable.deleteMany({});

        console.log("Cleared old data");

        // Categories
        const cat1 = await Category.create({ title: "Vegetables" });
        const cat2 = await Category.create({ title: "Dairy" });

        // Users
        await User.create([
            {
                name: "John Doe",
                email: "john@example.com",
                password: "hashedpassword1",
                position: "general-manager",
                status: "active",
                restaurantName: "Taste Hub"
            },
            {
                name: "Mary Smith",
                email: "mary@example.com",
                password: "hashedpassword2",
                position: "kitchen-manager",
                status: "inactive",
                restaurantName: "Taste Hub"
            }
        ]);

        // Products
        await Product.create([
            {
                title: "Tomatoes",
                category_id: cat1._id,
                vendor: "FreshFarm Co",
                vendorInfo: "Best quality vegetables",
                quantity: 120,
                unit: "kg",
                price: 2.5,
                parLevel: 50,
                image: []
            },
            {
                title: "Milk",
                category_id: cat2._id,
                vendor: "DairyBest",
                vendorInfo: "Organic dairy supplier",
                quantity: 80,
                unit: "litre",
                price: 3.2,
                parLevel: 30,
                image: []
            }
        ]);

        console.log("Seed data inserted successfully");
        process.exit(0);
    } catch (err) {
        console.error("Error seeding DB:", err);
        process.exit(1);
    }
}

seed();

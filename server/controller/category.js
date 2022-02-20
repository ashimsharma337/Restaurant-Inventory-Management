const router = require('express').Router();
const isLoggedIn = require('../isLoggedIn/isLoggdIn');
const CategoryController = require("../routeController/category_controller");

const categoryController = new CategoryController();


router.route("/")
.get(categoryController.getAllCategories)
.post(isLoggedIn, categoryController.addCategory)

module.exports = router;
const router = require('express').Router();
const isLoggedIn = require('../isLoggedIn/isLoggdIn');
const CategoryController = require("../routeController/category_controller");

const categoryController = new CategoryController();


router.route("/")
.get(categoryController.getAllCategories)
.post(isLoggedIn, categoryController.addCategory)

router.route("/:id")
.delete(isLoggedIn, categoryController.deleteCategoryById)
.get(isLoggedIn, categoryController.getCategoryById)
.put(isLoggedIn, categoryController.updateCategoryById)


module.exports = router;
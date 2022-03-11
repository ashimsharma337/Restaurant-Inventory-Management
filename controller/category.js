 const router = require('express').Router();
const CategoryController = require("../routeController/category_controller");
const isLoggedIn = require("../middleware/isLoggedIn/isLoggedIn");

const categoryController = new CategoryController();


router.route("/")
.get(categoryController.getAllCategories)
.post(isLoggedIn, categoryController.addCategory)

router.route("/:id")
.delete(isLoggedIn, categoryController.deleteCategoryById)
.get(isLoggedIn, categoryController.getCategoryById)
.put(isLoggedIn, categoryController.updateCategoryById)


module.exports = router;
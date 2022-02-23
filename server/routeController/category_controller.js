const Category = require("../model/Category_model");

class CategoryController{
    getAllCategories = (req, res, next) => {
       Category.find()
       .populate("parent_id")
       .then((categories) => {
           res.json({
               result: categories,
               status: true,
               msg: "Category List"
           })
       })
       .catch((error) => {
           let err = {
               status: 200,
               msg: JSON.stringify(error)
           }
           next(err);
       })
    }

    addCategory = (req, res, next) => {

        let newCat = new Category(req.body);

        newCat.save()
        .then((success) => {
            res.status(200).json({
                result: newCat,
                status: 200,
                msg: "Category added successfully"
            });
        })
        .catch((error) => {
            res.status(200).json({
                result: req.body,
                status: 400,
                msg: JSON.stringify(error)
            });
            
        })
        
    }

    deleteCategoryById = (req, res, next) => {
        Category.deleteOne({
            _id: req.params.id
        })
        .then((success) => {
            res.json({
               result: JSON.stringify(success),
               status: 200,
               msg: "Category deleted successfully."
            })
        })
        .catch((error) => {
            res.json({
                result: null,
                status: 400,
                msg: JSON.stringify(error)
             })
        })
    }

    getCategoryById = (req, res, next) => {
        Category.findById({
            _id: req.params.id
        })
        .then((category) => {
            res.json({
               result: category,
               status: 200,
               msg: "Category found"
            })
        })
        .catch((error) => {
            res.json({
                result: null,
                status: 400,
                msg: JSON.stringify(error)
             })
        })
    }

    updateCategoryById = (req, res, next) => {
        Category.updateOne({
            _id: req.params.id
        },
        {
            $set: req.body
        }, 
        )
        .then((success) => {
            res.json({
                result: req.body,
                status: 200,
                msg: "Category updated successfully."
            })
        })
        .catch((error) => {
            res.json({
                result: null,
                status: 400,
                msg: JSON.stringify(error)
            })
        })
    }
}

module.exports = CategoryController;
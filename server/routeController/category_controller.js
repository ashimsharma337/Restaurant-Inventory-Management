const Category = require("../model/Category_model");

class CategoryController{
    getAllCategories = (req, res, next) => {
       Category.find()
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
            res.json({
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
}

module.exports = CategoryController;
const express = require("express");
const router = express.Router();
const ProductModel = require("../model/Product_model");


router.get("/", (req, res) => {
    ProductModel.find((error, products) => {
        if(products){
            res.json({
                result: products
            });
        } else {
            res.json({
                data: null,
                status: 400,
                msg: JSON.stringify(error)
           });
        }
    })
    .populate("category_id")
});

router.post("/", (req, res, next) => {
    const product = new ProductModel(req.body);
    product.save((error, product) => {
        if(product){
            res.json({
                data: product,
                status: 200,
                msg: "Product added succesfully"
            });
        } else {
            res.json({
                data: null,
                status: 400,
                msg: JSON.stringify(error)
            })
        }
    })
    
});

router.put("/:id", (req, res, next) => {
      ProductModel.updateOne({
          _id: req.params.id
      }, {
          $set: req.body
      }, {
          upsert: false
      })
      .then((product) => {
          res.json({
              data: product,
              status: 200,
              msg: "Product updated successfully!"
          });
      })
      .catch((error) => {
          res.json({
              data: null,
              status: 400,
              msg: JSON.stringify(error)
          })
      })
})

router.get("/:id", (req, res, next) => {
      ProductModel.findOne({_id: req.params.id}, {}, {})
      .then((product) => {
          res.json({
              result: product,
              status: 200,
          })
      })
      .catch((error) => {
          res.json({
              data: null,
              status: 400,
              msg: JSON.stringify(error)
          });
      })
})

router.delete("/:id", (req, res, next) => {
    ProductModel.deleteOne({_id: req.params.id})
    .then((success) => {
        res.json({
            data: null,
            status: 200,
            msg: "Product deleted successfully"
        })
    })
    .catch((error) => {
        res.json({
            data: null,
            status: 400,
            msg: JSON.stringify(error)
        })
    })
})


module.exports = router;
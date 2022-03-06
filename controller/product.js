const express = require("express");
const router = express.Router();
const uploader = require("../uploader/uploader");


const ProductModel = require("../model/Product_model");
const isLoggedIn = require("../middleware/isLoggedIn/isLoggedIn");

router.route("/")
.get(isLoggedIn, (req, res) => {
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
})

.post(isLoggedIn, uploader.array("image", 4), (req, res, next) => {
    
    if(req.files){
        let image = [];
        image = req.files.map((o) => o.filename);
        req.body.image = image;
    }
    

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

router.route("/:id")
.put(isLoggedIn, uploader.array("image", 4), (req, res, next) => {
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

.patch(isLoggedIn, uploader.array("image", 4), (req, res, next) => {
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

.get(isLoggedIn, (req, res, next) => {
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

.delete(isLoggedIn, (req, res, next) => {
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
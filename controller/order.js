const router = require("express").Router();
const orderModel = require("../model/Order_model");

const OrderItem = require("../model/Order_model");
const OrderTable = require("../model/Order_model");

router.post("/", (req, res, next) => {
    const orderItem = new OrderItem(req.body);
    
    orderItem.save((err, item) => {
        if(item){
            res.json({
                data: item,
                status: 200,
                msg: "item added succesfully"
            });
        } else {
            res.json({
                data: null,
                status: 400,
                msg: JSON.stringify(error)
            })
        }
    })
})

router.get("/", (req, res, next) => {
     OrderItem.find((err, items) => {
        if(items){
            res.json({
                data: items,
                status: 200,
                msg: "items list"
            });
        } else {
            res.json({
                data: null,
                status: 400,
                msg: JSON.stringify(error)
            })
        }
    })
})


module.exports = router;
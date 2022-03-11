const router = require("express").Router();
const OrderModel = require("../model/Order_model");



router.post("/", (req, res, next) => {
    console.log(req.body);
    //const { OrderItem, quantity, unitPrice, totalPrice, userName } = req.body;
    const item = req.body;
    console.log("item+>>", item);
    const orderInfo = new OrderModel({
          items: [item],
    });
    console.log(orderInfo);
    orderInfo.save((err, item) => {
        if(item){
            res.status(200).json({
                result: item,
                status: 200,
                msg: "item added succesfully"
            });
        } else {
            res.status(200).json({
                result: null,
                status: 400,
                msg: JSON.stringify(err)
            })
        }
    });
})

router.get("/", (req, res, next) => {
    OrderModel.find((err, list) => {
        if(err){
            res.status(200).json({
                result: null,
                status: 400,
                msg: JSON.stringify(err)
            });
        } else {
            let preItem = list[list.length-1];
            res.status(200).json({
                result: preItem,
                status: 200,
                msg: "Order List."
            });
        }
    })
})


module.exports = router;
const router = require("express").Router();
const userModel = require("../model/User_model");
const bcrypt = require("bcryptjs");

router.get("/", (req, res, next) => {

    userModel.findOne({email: req.body.email}, function(err, user){
        if(user){
            bcrypt.compare(req.body.password, user.password, function(error, success){
                if(!success){
                    res.json({
                        data: null,
                        status: 400,
                        msg: "Wrong Password"
                    })
                } else {
                    res.json({
                        data: user,
                        status: 200,
                        msg: "Login success"
                    })
                }
            })
        } else {
            res.json({
                data: null,
                status: 404,
                msg: "No user found"
            })
        }
    })

})

module.exports = router;
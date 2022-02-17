const router = require("express").Router();
const userModel = require("../model/User_model");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const isLoggedIn = require("../isLoggedIn/isLoggdIn");


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
                        msg: "Login success",
                        token: jwt.sign(
                            {id: user._id,
                             name: user.name,
                             email: user.email,
                             position: user.position,
                             status: user.status,
                             restaurantName: user.restaurantName
                            }, 
                            process.env.PRIVATEKEY)
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


router.get('/dashboard', isLoggedIn, (req, res, next) => {
    // verify
    res.json({
        data: req.user,
        status: true,
        msg: "welcome to admin panel"
    })
})

module.exports = router;
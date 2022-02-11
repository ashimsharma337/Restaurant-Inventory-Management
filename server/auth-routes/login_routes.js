const router = require("express").Router();
const userModel = require("../model/User_model");

router.get("/", (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;
    
    userModel.findOne({email}, function(err, user) {
        if(user){
            res.json({
                data: user,
                status: 200,
                msg: "Login success"
            });
        } else {
            res.json({
                data: null,
                status: 400,
                msg: "User not found."
            });
        }
    })
    
});

module.exports = router;
const router = require("express").Router();
const UserModel = require("../model/User_model");

router.post("/", (req, res, next) => {
    let user = new UserModel(req.body);
    user.save((error, user) => {
        if(error){
            next(error);
        } else {
            res.json({
                data: user,
                status: 200,
                msg: "User registered successfully."
            })
        }
    })
});


module.exports = router;
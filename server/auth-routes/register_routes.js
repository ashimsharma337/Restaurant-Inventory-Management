const router = require("express").Router();
const UserModel = require("../model/User_model");

const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);




router.post("/", async (req, res, next) => {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(req.body.password, salt);

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
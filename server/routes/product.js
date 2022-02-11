const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
    res.json({
        msg: "this is my home page"
    })
});

router.post("/", (req, res, next) => {
    res.json({
        data: req.body
    })
    
});


module.exports = router;
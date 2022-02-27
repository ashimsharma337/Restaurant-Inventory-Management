var express = require('express');
const User = require('../model/User_model');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
     User.find()
     .then((users) => {
       res.json({
         result: users,
         status: 200,
         msg: "Users List"
       })
     })
     .catch((error) => {
      res.json({
        result: null,
        status: 400,
        msg: JSON.stringify(error)
      })
     })
});

router.delete("/:id", (req, res, next) => {
      User.deleteOne({_id: req.params.id})
      .then((success) => {
        res.json({
           status: 200,
           msg: "user deleted succesfully"
        })
      })
      .catch((error) => {
        res.json({
          status: 400,
          msg: "error while deleting user"
       })
      })
})



module.exports = router;

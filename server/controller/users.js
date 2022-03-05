var express = require('express');
const req = require('express/lib/request');
const User = require('../model/User_model');
var router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn/isLoggedIn");
const isGM = require("../middleware/isGeneralManager/isGM");

/* GET users listing. */
router.get('/', isLoggedIn, function(req, res, next) {
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

router.route("/:id")
.get(isLoggedIn, (req, res, next) => {
  User.findOne({_id: req.params.id})
  .then((user) => {
    res.json({
       data: user,
       status: 200,
       msg: "user found succesfully"
    })
  })
  .catch((error) => {
    res.json({
      data: null,
      status: 400,
      msg: "error while finding user"
   })
  })
})
.delete(isLoggedIn, isGM, (req, res, next) => {
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
.put(isLoggedIn, isGM, (req, res, next) => {
  User.updateOne({
    _id: req.params.id
  },{
    $set: req.body
  }, {
    upsert: false
  })
  .then((user) => {
    res.json({
       data: req.body,
       status: 200,
       msg: "user updated succesfully"
    })
  })
  .catch((error) => {
    res.json({
      data: null,
      status: 400,
      msg: "error while updating user"
   })
  })
})



module.exports = router;

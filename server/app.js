var createError = require('http-errors');
var express = require('express');
var path = require('path');
require("dotenv").config();
var cors = require("cors");

require("./db_init");
const PORT = process.env.PORT || 9000;



var productRouter = require("./controller/product");
var registerRouter = require("./auth-routes/register_routes");
var loginRouter = require("./auth-routes/login_routes");
var categoryRouter = require("./controller/category");


var app = express();




app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


app.use(cors());
app.use("/products", productRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/category", categoryRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

app.listen(PORT, "localhost", (err) => {
   if(err){
      console.log(`Error Listening at ${PORT}`);
   } else {
      console.log(`Server Listening at ${PORT}`);
   }
});

module.exports = app;

let express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(process.cwd(), "build")));

app.use("/", function(req, res, next) {
    res.sendFile(path.join(process.cwd(), "build/index.html"));
})

app.listen(process.env.PORT || 80, function(err) {
    if(!err){
        console.log("Server is listening at port 80");
    }
})
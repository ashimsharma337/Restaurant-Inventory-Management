const jwt = require("jsonwebtoken");
require("dotenv").config();

const isLoggedIn = (req, res, next) => {
    
    let token = null;

    if(req.headers['authorization']){
        token = req.headers['authorization'];
    }
    if(req.headers['x-access-token']){
        token = req.headers['x-access-token'];
    }
    if(req.query.token){
        token = req.query.token;
    }

    const strSplit = token.split(' ');
    token = strSplit[strSplit.length - 1];

    if(token === null){
        next("Access denied.");
    }

    const data = jwt.verify(token, process.env.PRIVATEKEY);
    if(!data){
        next('Invalid token')
    }

    req.user = data;   
    next();
}

module.exports = isLoggedIn;
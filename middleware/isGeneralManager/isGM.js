const isGm = (req, res, next) => {
    // console.log(req.body.position);
    if(req.body.position == 'general-manager'){
        next();
    } else {
        res.status(200).json({
            status: 400,
            data: null,
            msg: "Oops! For General Manager only.!"
        });
    }
}
module.exports = isGm;
const multer = require("multer");


const fileFilter = function(req, file, cb){
    const mimetype = file.mimetype.split("/")[0];
    if(mimetype === "image"){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const appStorage = multer.diskStorage({
    filename: function(req, file, cb){
        const filename = Date.now() + file.originalname;
        cb(null, filename);
    },
    destination: function(req, file, cb){
        cb(null, process.cwd()+"/uploads");
    },
    fileFilter: fileFilter
    
});


const upload = multer({
      storage: appStorage,
      fileFilter: fileFilter
});

module.exports = upload;
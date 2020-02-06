const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { files } = require('../app.js')
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const Image = require('../schema/Image');




// dirPath: target image directory
function getImagesFromDir(dirPath) {
 
    // All iamges holder, defalut value is empty
    let allImages = [];
 
    // Iterator over the directory
    let files = fs.readdirSync(dirPath);
 
    // Iterator over the files and push jpg and png images to allImages array.
    for (file of files) {
        let fileLocation = path.join(dirPath, file);
        var stat = fs.statSync(fileLocation);
        if (stat && stat.isDirectory()) {
            getImagesFromDir(fileLocation); // process sub directories
        } else if (stat && stat.isFile() && ['.jpg', '.png'].indexOf(path.extname(fileLocation)) != -1) {
            allImages.push(file); // push all .jpf and .png files to all images 
        }
    }
 
    // return all images in array formate
    return allImages;
}
    
// Check file type function
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
}



//Set storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

//init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 10000000},
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
})
.single('myImage');



// Dashboard
router.get('/dashboard', ensureAuthenticated, (req,res) =>
 res.render('dashboard', {
     name: req.user.name,
     files:  getImagesFromDir(path.join(__dirname, '../public/uploads'))
 }));
// Dashboard
router.get('/dashboard/upload', ensureAuthenticated, (req,res) =>
 res.render('upload', {
     name: req.user.name,
     files:  getImagesFromDir(path.join(__dirname, '../public/uploads'))
 }));




 // Post handle

router.post('/dashboard/upload', (req, res) => {

    upload(req, res, (err) => {
        if(err){
            res.render('upload',{
                 msg: err,
                files: getImagesFromDir(path.join(__dirname, 'public/uploads'))
                //files :Image.find({"content" : 1})
                });
        }else {
            if(req.file == undefined) {
                res.render('upload', {
                    msg: 'Error: No file selected!',
                    files:  getImagesFromDir(path.join(__dirname, 'public/uploads'))
                    //files: Image.find({"content" : 1})
                });
            } else {
                   
                    let image = new Image({
                        content: 'uploads/' + req.file.filename,
                        created_at: new Date().toLocaleString()
                    });
                    image.save(function(err){
                        if(err){
                            console.log(err);
                            return;
                        } 
                        res.render('upload', {
                            msg: 'Post Uploaded !',
                            files:Image.find({"content" : 1})
                        });        
                    
                });          
                 
            }
            
        }
    });
});


module.exports = router;
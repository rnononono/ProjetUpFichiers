const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
// USer model
const User = require('../schema/User');

//Login page
router.get('/login', (req,res) => res.render('login'));

//Register page
router.get('/register', (req,res) => res.render('register'));

router.get('/upload', (req, res)=> res.render('upload'));



// register handle
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

router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if(!name || !email || !password || !password2) {
      errors.push({msg : 'Please fill in all fields '});
  }

  //check passwords match
  if(password !== password2) {
      errors.push({msg: 'Passwords do not match'});
  }
  //check pass length
  if(password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 char '});
  }

  if(errors.length > 0) {
    res.render('register', {
        errors,
        name,
        email,
        password,
        password2
    });
  } else {
     //Validation passed
    User.findOne({ email: email })
    .then(user => {
        if(user){
            // User exists 
            errors.push({ msg: 'Email is already registered '});
            res.render('register', {
                errors,
                name,
                email,
                password,
                password2
            });
        } else {
            const newUser = new User({
                name,
                email,
                password
            });

            //Hash password
            bcrypt.genSalt(10, (err, salt) =>
             bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err) throw err;
                // Set password to hash
                newUser.password = hash;
                //save user
                newUser.save()
                .then(user => {
                    req.flash('success_msg', 'You are now registered and can log in');
                    res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            }))

            console.log(newUser)
            

        }
    });
  }
});

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Post handle
const Image = require('../schema/Image');
router.post('/upload', (req, res) => {

    upload(req, res, (err) => {
        if(err){
            res.render('upload',{
                 msg: err,
                 //files: getImagesFromDir(path.join(__dirname, 'public/uploads'))
                files :Image.find({"content" : 1})
                });
        }else {
            if(req.file == undefined) {
                res.render('upload', {
                    msg: 'Error: No file selected!',
                    //files:  getImagesFromDir(path.join(__dirname, 'public/uploads'))
                    files: Image.find({"content" : 1})
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



// Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});



module.exports = router;
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const flash = require('connect-flash');
const passport = require('passport');


const Image = require('./schema/Image');
const Register = require('./schema/Form');

//init app
const app = express();

// Passport config
require('./config/passport')(passport);

//DB config
const db = require('./config/keys').MongoURI;
//Connect to Mongo
mongoose.connect(db,
{  useNewUrlParser: true,
   useUnifiedTopology: true})
   .then(() => console.log('Connexion à MongolDB réussie !'))
   .catch(() => console.log('Connexion à MongolDB échouée !'));




//Middlewares
  
    //EJS
    app.use(expressLayouts);
    app.set('view engine', 'ejs');
    
    //body parser
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    // Express session middleware
    app.use(session({
        secret : 'keyboard cat',
        resave : true,
        saveUninitialized : true
     }));

     // Passport middleware
     app.use(passport.initialize());
    app.use(passport.session());
     
     // Connect flash
     app.use(flash());

     // Global vars
     app.use((req, res, next) => {
         res.locals.success_msg = req.flash('success_msg');
         res.locals.error_msg = req.flash('error_msg');
         res.locals.error = req.flash('error');
         next();
     } );






let files = getImagesFromDir(path.join(__dirname, 'public/uploads'));
//let files = Image.find({}, { projection: {_id:0, content: 1, created_at: 2}});




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




//Public Folder
//app.use(express.static('./public'));

//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


app.get('/', (req, res) => {  

    res.render('index', {
        files:  getImagesFromDir(path.join(__dirname, 'public/uploads'))
    })
    console.log(files);
});
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
    

app.post('/upload', (req, res) => {    
    upload(req, res, (err) => {
        if(err){
            res.render('index',{
                 msg: err,
                 //files: getImagesFromDir(path.join(__dirname, 'public/uploads'))
                files :Image.find({"content" : 1})
                });
        }else {
            if(req.file == undefined) {
                res.render('index', {
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
                        res.render('index', {
                            msg: 'Post Uploaded !',
                            files:Image.find({"content" : 1})
                        });        
                    
                });          
                 
            }
            
        }
    });
});


// Paramètres que l'application va récupérer
app.post('/sign_up', function(req,res)
{ 

    //Verif des champs
    if(req.body.name == undefined || req.body.email == undefined || req.body.password == undefined) {
        res.render('index', {
            msg: 'Veuillez remplir tous les champs !',
            //files: getImagesFromDir(path.join(__dirname, 'public/uploads'))
            files: Image.find({"content" : 1})
        });
    } else {

        let register = new Register({
    
           name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        register.save(function(err){
            if(err){
                console.log(err);
                return;
            } else {
                res.render('index', {
                    msg: 'Inscrit !',
                    //files: getImagesFromDir(path.join(__dirname, 'public/uploads'))
                    files:Image.find({"content" : 1})
                });
                }
            });
    }
    });
         

    

  
  


const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
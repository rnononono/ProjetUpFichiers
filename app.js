const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const Image = require('./schema/saveUrl.js');

//Db connect

mongoose.connect('mongodb+srv://nico_save:admin@cluster0-z5xvt.mongodb.net/test?retryWrites=true&w=majority',
{  useNewUrlParser: true,
   useUnifiedTopology: true})
   .then(() => console.log('Connexion à MongolDB réussie !'))
   .catch(() => console.log('Connexion à MongolDB échouée !'));




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
}).single('myImage');

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
            cb('Error: Images only! And for f***er : no GIF allowed');
        }
}


//init app
const app = express();
app.use(bodyParser.json());

//EJS
app.set('view engine', 'ejs');

//Public Folder
app.use(express.static('./public'));



app.get('/', (req, res) => {
    let imgs = [
        
            {"_id":{"$oid":"5e397a06ec0cd50ed825b189"},"content":"myImage-1580825094655.jpg","created_at":"04/02/2020 à 15:04:54","__v":{"$numberInt":"0"}},
            {"_id":{"$oid":"5e397a06ec0cd50ed825b189"},"content":"myImage-1580825094655.jpg","created_at":"04/02/2020 à 15:04:54","__v":{"$numberInt":"0"}},
            {"_id":{"$oid":"5e397a06ec0cd50ed825b189"},"content":"myImage-1580825094655.jpg","created_at":"04/02/2020 à 15:04:54","__v":{"$numberInt":"0"}}
        
    ];
                res.render('index', {
                content: 'Url des images',
                imgs: imgs
            });
        });

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.render('index',{
                 msg: err
                });
        }else {
            if(req.file == undefined) {
                res.render('index', {
                    msg: 'Error: No file selected!'
                });
            } else {
                {    
                    let image = new Image({
                        content: 'uploads/' + req.file.filename,
                        created_at: new Date().toLocaleString()
                   });
                    image.save()
                    
                    res.render('index', {
                        msg: 'File uploaded !',
                        file: `${image.content}`
                        
                    },
                   );
                 }
            }
            
        }
    });
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
// Dépendances
var express = require("express"); 
var bodyParser = require("body-parser"); 
const mongoose = require("mongoose");
 
// Connexion BDD distante
mongoose.connect('mongodb+srv://nico_save:admin@cluster0-z5xvt.mongodb.net/test?retryWrites=true&w=majority');
var db = mongoose.connection; 
// Affichage d'une erreur si on arrive pas à se connecter 
db.on('error', console.log.bind(console, "Erreur de connexion"));
// Connexion réussie
db.once('open', function(callback)
{ 
    console.log("RAS"); 
}) 

// Init expressJS  
var app=express() 
   
app.use(bodyParser.json()); 
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
    extended: true
})); 

// Paramètres que l'application va récupérer
app.post('/sign_up', function(req,res)
{ 
    var name = req.body.name; 
    var email =req.body.email; 
    var pass = req.body.password; 
  
    var data = 
	{ 
        "name": name, 
        "email":email, 
        "password":pass, 
    } 
		db.collection('details').insertOne(data,function(err, collection)
		{ 
        if (err) throw err; 
        console.log("Votre inscription s'est bien effectuée !"); 
        }); 
          // Redirection vers la page indiquant le succès de l'inscription
		return res.redirect('signup_success.html'); 
}) 
  
  
app.get('/',function(req,res){ 
res.set({ 
    'Access-control-Allow-Origin': '*'
    }); 
return res.redirect('index.html'); 
}).listen(3000) 
  
  
console.log("server listening at port 3000");

var express = require ("express");
var app = express ();
var path = require ("path");
var bodyParser = require ("body-parser");
app.use (bodyParser.urlencoded({extended:false}));

var publicpath = path.resolve (__dirname, "public");
app.use (express.static (publicpath));

app.get('/',function(req,res){
  res.sendFile(publicpath + "/game.html");
});
app.post ("/", function (req, res) {
	res.sendFile (publicpath + "/game.html");
})

app.get('/javascripts/game.js',function(req,res){
  res.sendFile(publicpath + "/javascripts/game.js");
});

app.listen(3000);







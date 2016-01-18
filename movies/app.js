var express = require ("express");
var app = express();
var path = require ("path");
var handlebars = require ("express-handlebars").create({defaultLayout: "main"});
app.engine ("handlebars", handlebars.engine);
app.set ("view engine", "handlebars");
var publicpath = path.resolve (__dirname, "public");
var bodyParser = require ("body-parser");
app.use (bodyParser.urlencoded({extended:false}));
app.use (express.static (publicpath));


require('./db');

var mongoose = require('mongoose');
var Movie = mongoose.model('Movie');

app.use (function(req, res, next) {
	console.log ("\n\n");
	console.log (req.method, req.path);
	console.log (req.query);
	next();
})

app.get("/movies", function (req, res) {
	Movie.find (req.query, function (err, movies, count){
		res.render ("index", {movies:movies});
	})
})

app.post ("/movies", function (req, res) {
	var newEntry = new Movie ({title: req.body.movie, director: req.body.director});
	newEntry.save (function(err, saved, count) {
		console.log (saved);
		res.redirect ("/movies");
	})
})

app.listen(3000);

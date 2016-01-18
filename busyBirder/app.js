function inList (newBird, birds) {
	for (var i = 0; i < birds.length; i++) {
		var curBirdObj = birds[i];
		if (curBirdObj.name === newBird) {
			curBirdObj.seen = curBirdObj.seen+1;
			return true;
		}
	}
	return false;
}
function filterTheBirds (filterBirds, birds) {
	for (var i = 0; i < birds.length; i++) {

	}
}

//basic set up
var express = require ('express');
var path = require ('path');
var bodyParser = require ("body-parser");
var session = require ('express-session');
var app = express();
var handlebars = require ('express-handlebars').create({defaultLayout:'main'});
var sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: true, 
	resave: true 
};

app.engine ('handlebars', handlebars.engine);
app.set ('view engine', 'handlebars');
app.use (bodyParser.urlencoded({extended:false}));
app.use(session(sessionOptions));

//to allow static files (css & img)
var publicpath = path.resolve (__dirname, "public");
app.use (express.static (publicpath));

//logging req info
app.use (function (req, res, next) {
	console.log (req.method, req.url);
	console.log ('======');
	console.log('req.body: ', req.body);
	next();
});

//routes and global vars
var newBird = '';
var numSeen;
var filterBirds = [];
var birds = [{'name':'Bald Eagle','seen':3}, {'name':'Yellow Billed Duck','seen':7}, {'name':'Great Cormorant',
'seen':4}];


app.get ('/', function (req, res) {
	console.log(req.session.numSeen);
	console.log("headers", req.headers);
	res.render ('home');
});
app.get('/birds', function (req, res) {
	var minVal = req.session.numSeen;
	console.log (req.session.numSeen);
	filterBirds = birds.filter (function (obj) {
		if (obj.seen >= minVal) {
			return true;
		}
		else {
			return false;
		}
	});
	console.log (filterBirds);
	if (minVal !== undefined) {
		res.render ('birds', {'birdList':filterBirds});
	}
	else {
		res.render ('birds', {'birdList':birds});
	}
});

app.post ('/birds', function (req, res) {
	newBird = req.body.newBird;
	if(newBird !== '') {
		var isBirdinList = inList(newBird, birds);
		if (!isBirdinList) {
			birds.push ({'name':newBird, 'seen': 1});
		}
	}
	res.redirect(302, "/birds");
});

app.get('/settings', function (req, res) {
	if (req.session.numSeen != undefined) {
		res.render ('settings', {'value':req.session.numSeen})
	}
	else {
		res.render ('settings');
	}
});

app.post ("/settings", function (req, res) {
	req.session.numSeen = req.body.numSeen;
	res.redirect (302, '/birds');
});

app.use (function (req, res, next) {
  res.status(404);
  res.render ('404')
})




app.listen(3000)



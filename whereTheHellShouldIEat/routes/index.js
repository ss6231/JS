var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var Factual = require('factual-api');
var factual = new Factual('cC5oJZoBE1Jsi6kziJcHDtdSM3OXSgGZTbsHJGIV', '9EMfN9oEkjiVc8DUiCcOwiQYCtKPAp2iCTuMtw9V');
var passport = require('passport');

var Restaurant = mongoose.model ('Restaurant');
var User = mongoose.model ('User');

/* Instead of displaying prices as '1, 2, 3, 4,' as it is shown in the factual API, display the numbers as dollar signs 
on the dropdown menu of /pickforme. This function does just that and returns an array of dollar signs as [$, $$, $$$, $$$$]
*/

function convertToDollarSign (price) {
	var priceSymbol = [];
	var curSymbol = "";
	for (var i = 0; i < price.length; i++) {
		for (var j = 0; j < price[i]; j++) {
			curSymbol +=  "$";
		}
		priceSymbol.push (curSymbol);
		curSymbol = "";
	}
	return priceSymbol;
}

/*
This function checks to see if an object is empty, ie: {}
*/

function isEmpty (obj) {
	if (obj == null) return true;
	for (var key in obj) {
		if (obj.hasOwnProperty (key)) {
			return false;
		}
	}
	return true;
}

/*
This function checks to see if the user has left a dropdown option as the default (ie: the user has NOT chosen anything for
that particular field) and deletes it from the userQuery object all together. The userQuery object will be sent as a query parameter
to the factual API or my mongoDB to return a restaurant with those specifications. So there will be no empty fields in the
userQuery object. I'll know that if the value of that dropdown menu is set to either "Neighborhood," "Cuisine," or 
"Price," that field is empty and should be deleted from the object before sending a request to the db. 
*/

function checkFilters () {
	for (var key in userQuery) {
		if (userQuery.hasOwnProperty (key)) {
			if (userQuery[key] === "Neighborhood") {
				delete userQuery.neighborhood;
			}
			if (userQuery[key] === "Cuisine") {
				delete userQuery.cuisine;
			}
			if (userQuery[key] === "Price") {
				delete userQuery.price;
			}
			else if (key === "price") {
				userQuery.price = userQuery.price.length;
			}
		}
	}
}

/*
This function is needed to prevent duplicate restaurants from being saved in my db. It is used to see if resultArr 
(which is an array of restaurants resulting from a query from my mongoDB) is already stored in my db by checking factual 
ID (this param is the factual ID of the restaurant returned from a query to the factual API). As seen when this function
is called in the code, if the restaurant is not found in my db, then 1) a new Restaurant is created with that factual ID 
2) that Restaurant is stored in my db and 3) The restaurant is returned as an option to the user to pick from and saved into
my db. However, if it IS found in my db, then the restaurant is NOT saved, but is still returned to the user as a viable option
*/

function foundInDB (resultArr, id) {
	for (var i = 0; i < resultArr.length; i++) {
		if (resultArr[i].factual_id === id) {
			return i;
		}
	}
	return -1;
}

/*
These 3 variables are global vars I will use throughout my code. userQuery is an object that stores all the specifications (if any)
the user has (such as neighborhood, cuisine, and price point). alreadySaved is a string that will store a message if the user
wants to save the given restaurant option, but already has that exact restaurant stored in their previously saved options. notFound
is a string that will store a message when the user's specifications are too specific and thus no restaurant exists with those
requirements
*/

var userQuery = {region:"NY", locality:"New York"};
var alreadySaved = "";
var notFound = ""

router.get('/', function(req, res, next) {
	notFound = "";
  res.render('index');
});

/*
This page will display the list of neighborhood, cuisine, and price point options in a dropdown menu. First, it will make
a request to the factual API with the only query specification that the region be NY (specific functionality, I know, but 
it makes my life a little easier). This request will return a list of around 20 restaurants, each of which has its own variables
for the 3 aforementioned options. This function will take those variables and extract the data to store them in arrays, which will
be rendered on the HTML page as options to choose from in the dropdown menu
*/

router.get('/pickforme', function(req, result, next) {
	factual.get('/t/restaurants-us',{filters:{region:"NY", locality:"New York"}}, function (error, res) {
		var neighborhoods = [];
		var cuisine = [];
		var price = [];
		for (var i = 0; i < res.data.length; i++) {
			var neighborhoodArr = res.data[i].neighborhood;
			var cuisineArr = res.data[i].cuisine;
			var priceVar = res.data[i].price;
			if (neighborhoodArr != undefined) {
				for (var j = 0; j < neighborhoodArr.length; j++) {
					if (neighborhoodArr[j] != undefined && neighborhoods.indexOf(neighborhoodArr[j]) == -1) {
						neighborhoods.push (neighborhoodArr[j]);
					}
				}
			}
			if (cuisineArr != undefined) {
				for (var j = 0; j < cuisineArr.length; j++) {
					if (cuisineArr[j] != undefined && cuisine.indexOf(cuisineArr[j]) == -1) {
						cuisine.push (cuisineArr[j]);
					}
				}
			}
			if (priceVar != undefined && price.indexOf(priceVar) == -1) {
				price.push (priceVar);
			}
			if (i == res.data.length-1) {
				neighborhoods.sort();
				cuisine.sort();
				price.sort ();
				price = convertToDollarSign(price);
				if (!isEmpty(req.query)) {
					userQuery = req.query;
					userQuery.region = "NY";
					userQuery.locality="New York";
					result.redirect ("/results");
				}
				else {
					result.render ("pickforme", {'neighborhoods': neighborhoods, 'cuisine':cuisine, 'price': price, 'user':req.user,'notFound':notFound});
				}
			}
		}
	});
});

/*
This page will display the results based on the userQuery. First, it checks the mongoDB to see if any viable restaurant options
are available. If there are, then it will return that restaurant, but if not, then it'll make a request to the factual API,
save that restaurant into the mongoDB, and then display it to the user. In order to keep things fresh, if there are viable 
options in the db and there are fewer than 5 restaurants in the db, I force a request to the factual API just to get more
choices stored. If the user's query is too specific from the dropdown menu, a message will be displayed and no option will be
given 
*/

router.get('/results', function(req, res, next) {
	checkFilters ();
	Restaurant.find (userQuery, function (err, resultArr, count) {
		/*
			if the number of results from this query from my db is less than 10, then make a request to the factual API db
			if the factual ID from that query matches one from my db, then DONT STORE IT but return that restaurant
			if it does not match, store it and return that restaurant

			if it's greater than 10, then just return whatever is in the database at random index
		*/
		if (resultArr.length < 5) {
			factual.get('/t/restaurants-us',{filters:userQuery}, function (error, resFact) {
				//then pick a random index from range 0 thru range of factual API query result
				var randomIndex = Math.floor (Math.random() * resFact.data.length);
				var restaurantObj = resFact.data[randomIndex];
				if (restaurantObj != undefined) {
					notFound = "";
					var ind = foundInDB (resultArr, restaurantObj.factual_id);
					if (ind === -1) {
						var rest = new Restaurant (resFact.data[randomIndex]);
						rest.save (function (err, addedRest, count) {
							req.session.rest = addedRest;
							res.render('results', {'rest':addedRest,'user':req.user});
						})
					}
					else {
						var foundRest = resultArr[ind];
						req.session.rest = foundRest;
						res.render ('results', {'rest':foundRest,'user':req.user});
					}
				}
				else {
					notFound = "Wow you're super picky. A restaurant with those specifications doesn't even exist!\nLet's try again";
					if (req.user) {
						res.redirect ("/user/" + req.user.slug);	
					}
					else {
						res.redirect ("/pickforme")
					}
					
				}
			});
		}
		else {
			//otherwise pick a random index from range 0 thru length of Restaurant db query result
			var randomIndex = Math.floor (Math.random () * resultArr.length)
			var rest = resultArr[randomIndex];
			req.session.rest = rest;
			res.render ('results', {'rest':rest, 'user':req.user, 'notFound':notFound});
		}
	})
});

/*
This page is only shown to users who have logged in as it gives them a chance to store the restaurant for future use. If the 
logged in user has previously saved this same restaurant, a message will be displayed and the restaurant will not be saved in 
the db
*/
router.post ("/results", function (req, res, next) {
	var found = false;
	User.findOne ({'username':req.user.username}, function (err, user, count) {
		for (var i = 0; i < user.restaurants.length; i++) {
			if (user.restaurants[i].name === req.session.rest.name) {
				alreadySaved = "Hey, you've already saved this place!";
				found = true;
				break;
			}
		}
		if (found) {
			res.redirect ("/user/" + req.user.slug);
		}
		else {
			alreadySaved = "";
			var newRest = {'name':req.session.rest.name, 'website':req.session.rest.website}
			user.restaurants.push (newRest);
			user.save (function (saveErr, saveUser, saveCount) {
				res.redirect ("/user/" + req.user.slug);
			})
		}
	})
})

/*
Displays login page
*/
router.get ("/login", function (req, res, next) {
	res.render ("login");
})

/*
If the user exists, it'll redirect to their home page. Else, it'll display an error message
*/

router.post ("/login", function (req, res, next) {
	passport.authenticate('local', function(err,user) {
    if(user) {
      req.logIn(user, function(err) {
        res.redirect('/user/' + user.slug);
      });
    } else {
      res.render('login', {'message':'Your login or password is incorrect.'});
    }
  })(req, res, next);
})

/*
Displays register/sign up page
*/
router.get("/register", function(req, res, next) {
  res.render('register');
});

/*
If there is an error in registration, a message will be displayed. Otherwise it'll redirect to a new user page
*/
router.post ("/register", function (req, res, next) {
	User.register(new User({username:req.body.username}), 
      req.body.password, function(err, user){
    if (err) {
      res.render('register',{'message':'Your registration information is not valid'});
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/user/' + req.user.slug);
      });
    }
  });  
})

/*
This page will only be requested if the user has logged in and has their own account. It just displays a list of previously
saved restaurants
*/
router.get ("/user/:slug", function (req, res, next) {
	res.render ("user", {'user':req.user, 'message':alreadySaved, 'notFound':notFound});
})

/*
This is used in conjuction with my ajax script to dynamically update a user's home page (which again, displays a list of previously
saved restaurants). The page will display an [x] button next to the restaurant to allow the user to delete that option without
having to refresh the page. This post method will update the mongodb to remove that restaurant from the User schema 
*/
router.post ("/user/:slug", function (req, res, next) {
	console.log (req.body);
	User.findOneAndUpdate ({'username':req.user.username}, {$pull: {restaurants:req.body}}, function (err, result, count) {
	}) 
})

/*
Logs users out from their accounts
*/
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;







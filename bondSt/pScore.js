//global variables for Yelp API
var Yelp = require('yelp');
	var yelp = new Yelp({
	  consumer_key: 'vKfCAk9wkSYX9ITVDuufdw',
	  consumer_secret: 'x0EJ3t3D36sE0lTnLZve-7871lo',
	  token: '5zmKLHExTq_YKnBtjxk9GFD-fy1j0HyF',
	  token_secret: 'WJk4now73_qzArrgqquwnecavmw',
	});

//global variables fro Google API
var key = 'key=AIzaSyC9DV-XUpLHTDwnUt77Q4hU1AqsP4Z74pw'

/**
 * This function searches for a business based on a name and address and returns the findings in a callback function due to the asynchronisity
 * @param  {String}   name     [name of the business]
 * @param  {String}   address  [address of the business]
 * @param  {Function} callback [callback function to return the data when this function actually processes it]
 */
function searchYelp (name, address, callback) {
	yelp.search({'location': address, 'name': name})
	.then(function (data) {
		var rating;
		var numRatings;
		var found = false;
		if (data.businesses) {
			for (var x in data.businesses) {
				if (data.businesses[x].name.toLowerCase() === name.toLowerCase()) {
					rating = data.businesses[x].rating;
					numRatings = data.businesses[x].review_count;
					found = true;
					callback({'rating':rating, 'numRatings':numRatings});
				}
			}
			if (found === false) {
				callback (undefined)	
			}
		}
	})
	.catch(function (err) {
	  console.error(err);
	});
}

/**
 * This function searches for the business based on its unique place_id, which is retrieved from the googleSearchFor() function. It returns the desired data in a callback
 * function
 * @param  {Number}   rating   [The rating of the given business]
 * @param  {String}   place_id [The unique place_id to retrieve detailed information]
 * @param  {Function} callback [Function to return the (rating, numReviews) pair]
 */
function googleGetReviews (rating, place_id, callback) {
	var request = require ('request');
	request ('https://maps.googleapis.com/maps/api/place/details/json?placeid='+place_id+'&'+key, function (err, res, body){
		if (!err && res.statusCode == 200) {
			var x = JSON.parse(body);
			var resultsObj = x.result;
			var numRatings;
			if (resultsObj) {
				numRatings = resultsObj.user_ratings_total
				callback(numRatings);
			}
		}
	})	
}

/**
 * Given the name and coordinates of the business, this function retrieves the unique place_id and sends this data to googleGetReviews() to get detailed information
 * @param  {String}   name     [name of the business]
 * @param  {Number}   lat      [Latitude endpoint]
 * @param  {Number}   lng      [Longitude endpoint]
 * @param  {Function} callback [Callback function to return the desired data]
 */
function googleSearchFor (name, lat, lng, callback) {
	var request = require ('request');
	var loc = lat+','+lng
	request ('https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyC9DV-XUpLHTDwnUt77Q4hU1AqsP4Z74pw&location='+loc+'&radius=500&name='+name, function (err, res, body) {
		if (!err && res.statusCode == 200) {
			var x = JSON.parse(body);
			var resultsObj = x.results;
			var rating;
			var place_id;
			if (resultsObj[0]) {
				rating = resultsObj[0].rating;
				place_id = resultsObj[0].place_id;
				if (rating === undefined) {
					callback (undefined)
				}
				else {
						googleGetReviews (rating, place_id, function (result) {
							callback ({'rating': rating, 'numRatings':result})
					})
				}
				
			}
			else {
				console.log ("\nThe business does not exist at this address. Please input the correct address\n");
				process.exit (1);
			}
		}
	});
}

/**
 * This function gets the coordinates of the input business  
 * @param  {String}   name     [name of the business]
 * @param  {String}   address  [address of the business]
 * @param  {Function} callback [callback function to return data]
 */
function googleGetCoord (name, address, callback) {
	var request = require ('request');
	request ('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=AIzaSyC9DV-XUpLHTDwnUt77Q4hU1AqsP4Z74pw', function (err, res, body){
		if (!err && res.statusCode == 200) {
			var x = JSON.parse(body);
			var lat;
			var lng;
			if (x.results[0]) {
				lat = x.results[0].geometry.location.lat;
				lng = x.results[0].geometry.location.lng;
				googleSearchFor(name, lat, lng, function (result) {
					callback (result);
				})
			}
			else {
				console.log ("\nThe entered address is not valid. Please try again\n");
				process.exit(1)
			}
		}
		else {
			console.log(err);
		}
	})
}
/**
 * Given the (ratings, numReviews) pair from each API, this function calculates a weighted score and then the corresponding raw score to return a p score. Scale for raw
 * score to p score is:
 * 1 --> 0 - .199
 * 2 --> .2 - .399
 * 3 --> .4-.599
 * 4 --> .6-.799
 * 5--> .8-1
 * @param  {Object} item1 [Object from Google Places API]
 * @param  {Object} item2 [Object from the Yelp API]
 * @return {Number}       [Final p score]
 */
function getPScore (item1, item2) {
	var totalRatings = item1.numRatings + item2.numRatings;
	var item1Weight = item1.numRatings / totalRatings;
	var item2Weight = item2.numRatings / totalRatings;
	var rawScore = item1Weight*item1.rating + item2Weight*item2.rating;
	return rawScore * .19

}
/**
 * This function processes the input and calls both of the APIs to request data. Upon receiving this information, it then calculates the p score
 */
function main () {
	var prompt = require('prompt');
  prompt.start();
  console.log ("\nInput the business's name and address below, avoiding unit, suite, and floor numbers if applicable \n");
  prompt.get(['name', 'address'], function (err, result) {
    googleGetCoord(result.name, result.address, function (res) {
    	searchYelp(result.name, result.address, function (res2) {
    		var undefObj = {'rating': 0, numRatings: 0};
    		var p = 0;
    		if (res === undefined && res2 === undefined) {
    			console.log ("\nThe business does not have any online presence on the set up APIs");
    		}
    		else if (res === undefined) {
    			 p = getPScore (undefObj, res2);
    		}
    		else if (res2 === undefined) {
    			p = getPScore(res, undefObj);
    		}
    		else {
    			p = getPScore (res, res2);
    		}
    		console.log ("\nP score:", p.toFixed(2), "\n")
    	});
    });
  });	
}

main ()
 


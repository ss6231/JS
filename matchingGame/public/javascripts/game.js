var button = document.getElementsByTagName ("button")[0];

//button event listener
var x;
var numClicked = 0;
var guesses = 0;
var matches = 0;
button.addEventListener ("click", function (evt) {
	//user input number of cards
	var input = document.getElementsByName ("inputNum")[0].value;
	var divForm = document.getElementById ("startForm");
	var form = document.getElementsByTagName("form")[0];
	//remove form
	divForm.removeChild (form);
	if (input > 8) {
		input = 8;
	}
	evt.preventDefault();
	createBoard (input);

});

//tile (ie: card) constructor for the board game
function Tile (x, y, width) {
	this.x = x;
	this.y = y;
	this.width = width;
}

//createBoard creates a canvas element to draw multiple tiles on to represent cards
function createBoard (inputNum) {
	var usedSymbols = [];
	var numCards = 2 * inputNum;
	var parentDiv = document.getElementById("game");
	var canvasContainer = document.createElement ("div");
	var guessHeader = document.createElement("h2");
	var val = document.createTextNode ("Number of guesses: ");
	guessHeader.appendChild(val);
	document.body.insertBefore (guessHeader, parentDiv);
	canvasContainer.setAttribute ("id", "canvasDiv");
	var canvas = document.createElement("canvas");
	canvas.setAttribute ("id", "myCanvas");
	var row = Math.floor (Math.sqrt (numCards));
	var col = Math.ceil (numCards / row);
	canvas.setAttribute("width", window.innerWidth);
	canvas.setAttribute("height", window.innerHeight);
	var ctx = canvas.getContext("2d");

	//draw out each tile and save into a tile array 
	var x = 40;
	var y = 40;
	var tileArr = [];
	var counter = 0;
	for (var i = 0; i < row; i++) {
		for (var j = 0; j < col; j++) {
			if (counter == numCards) break;
			roundRect (ctx, x, y, 120, 120);
			var tile = new Tile (x, y, 120);
			tileArr.push (tile);
			x += 150;
			counter++;
		}
		x = 40;
		y += 150;
	}
	canvasContainer.appendChild(canvas)
	parentDiv.appendChild(canvasContainer);
	populateImgArr (tileArr, inputNum, usedSymbols);
}

//function to create rounded tile corners
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
}

function populateImgArr (tileArr, numSymb, usedSymbols) {
	var basePath = "../images/";
	var imgArr = [];
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext ("2d");
	//this contains all the possible pictures that will show up on the cards
	var srcObj = populateSrcArr ();

	//creating enough images for the number of SYMBOLS given, NOT the number of cards
	for (var i = 0; i < numSymb.length * 2; i++) {
		imgArr[i] = document.createElement("img");
	}
	
	//this call back function draws out the images based on if all of the images needed are actually loaded
	loadImages (srcObj, function (images) {
		var i = 0;
		var firstRect;
		var secRect;
		var firstCard = {};
		var secondCard = {};
		var canv = document.getElementById("myCanvas");
		var guessHeader = document.getElementsByTagName("h2")[0];

		//event listener waits for a click on the coordinate of the cards in the canvas
		canv.addEventListener ("click", function (e){
			var rect = collides (tileArr, e.offsetX, e.offsetY);
			//ie: if the user clicked on a card, not on a random place on the page, then draw image
			if (rect != -1) {
				i = rect;
				var usedImg = images[rect];
				//draw the image of the card when there are less than 2 cards face up
				if (numClicked < 2) {
					for (var prop in usedImg) {
						ctx.drawImage (usedImg[prop],(tileArr[i].x + tileArr[i].width/2) - (usedImg[prop].width)/2, (tileArr[i].y + tileArr[i].width/2) - (usedImg[prop].height)/2)
						numClicked++;
						i++;
						if (numClicked == 1) {
							firstCard = usedImg;
							firstRect = rect;
						}
						//when there are 2 cards in view, update the number of guesses to the screen 
						if (numClicked == 2) {
							secondCard = usedImg;
							secRect = rect;
							guesses++;
							var guessNode = document.createTextNode (guesses);
							//ie: this is the first guess, so the header tag will only have 1 child ("Number of guesses:")
							if (guessHeader.childNodes.length < 2) {
								guessHeader.appendChild (guessNode);
							}
							//ie: header tag has "number of guesses:" as a child and the accumulated guesses as the second child
							else {
								var prevGuess = guessHeader.lastChild;
								guessHeader.replaceChild (guessNode, prevGuess);
							}
						}
					}
				}
				if (numClicked === 2) {
					//if the 2 cards in the current view match, keep them face up
					if (firstCard === secondCard) {
						numClicked = 0;
						matches++;
					}
					//if they don't match, clear them and reset the current number of cards clicked
					else {
						setTimeout (function () {
						for (var prop in firstCard) {
							ctx.clearRect ((tileArr[firstRect].x + tileArr[firstRect].width/2) - (firstCard[prop].width)/2, (tileArr[firstRect].y + tileArr[firstRect].width/2) - (firstCard[prop].height)/2,
								firstCard[prop].width, firstCard[prop].width);
							}
						for (var prop in secondCard) {
							ctx.clearRect ((tileArr[secRect].x + tileArr[secRect].width/2) - (secondCard[prop].width)/2, (tileArr[secRect].y + tileArr[secRect].width/2) - (secondCard[prop].height)/2,
								secondCard[prop].width, secondCard[prop].width);
						}
						numClicked = 0;
					}, 700);
						
					}
				}
			}
			//the user has guessed all the cards - clear board
			if (matches == numSymb) {
				setTimeout (function () {
					clearBoard (ctx, canvas);	
				}, 400);
			}
		})
	})
	
	//checks to see if user clicked on a tile in the canvas as opposed to any other space on the canvas
	function collides (tileArr, x, y) {
		var isCollision = -1;
		for (var i = 0; i < tileArr.length; i++) {
			var left = tileArr[i].x;
			var right = tileArr[i].x + tileArr[i].width;
			var top = tileArr [i].y;
			var bottom = tileArr[i].y + tileArr[i].width;
			if (right >= x && left <= x && bottom >= y  && top <= y) {
				isCollision = i;
			}
		}
		return isCollision;
	}

	//this function will go to the provided callback function only when all the images have actually loaded
	function loadImages(srcObj, callback) {
		var usedImages = [];
		var images = [];
	  var loadedImages = 0;
	  var numImages = 0;
	  // get num of sources
	  for(var i = 0; i < numSymb; i++) {
	    numImages++;
	  }
	  for(var i = 0; i < numSymb; i++) {
	  	var img = srcObj[i]; //current char: src object
	  	for (var src in img) {	
	  		var obj = {};
	  		obj[src] = document.createElement("img");
	  		obj[src].onload = function() {
		      if(++loadedImages >= numImages) {

		      	//duplicate the symbols that are actually used so that each card is assigned a symbol
		      	usedImages = images.map (function (item) {
		      		return [item, item];
		      	}).reduce (function (a,b) {return a.concat(b)});
		      	//shuffle the images so it is randomized
		      	usedImages = shuffle (usedImages);
		        callback(usedImages);
		      }
		    };
		    obj[src].src = img[src];
		    images.push (obj);
	  	}
		    
	  }
	}	
}

//stores all the source images into an array of objects
function populateSrcArr () {
	var basePath = "../images/"
	var srcObj = [
		{"boba": basePath + "boba.png"},
		{"chewie": basePath + "chewie.png"},
		{"darthvader": basePath + "darthvader.png"},
		{"deathstar": basePath + "deathstar.png"},
		{"leia": basePath + "leia.png"},
		{"milleniumfalcon": basePath + "milleniumfalcon.png"},
		{"r2": basePath + "r2.png"},
		{"trooper": basePath + "trooper.png"}
	];
	return srcObj;
}

//shuffles images array to randomize the images 
function shuffle (imgArr) {
	var shuffledArr = [];
	while (imgArr.length != 0) {
		var index = Math.floor ((Math.random () * imgArr.length)); 
		var rand_img = imgArr[index];
		imgArr.splice(index,1);
		shuffledArr.push (rand_img);
	}
	return shuffledArr;
}

//first clears the canvas (of the cards) then the div that previously held the canvas
//then it shows a finish message on the screen 
function clearBoard (ctx, canvas) {
	ctx.clearRect (0,0, canvas.width, canvas.height);
	var div = document.getElementById("game");
	document.body.removeChild (div);
	var done = document.createTextNode ("You're done! Thanks for playing! :)");
	var doneHeader = document.createElement ("h2");
	doneHeader.appendChild (done);
	document.body.appendChild (doneHeader);
}





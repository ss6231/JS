//grab div elements

var delDivs = document.getElementsByClassName ("deleteRest");
var restDivs = document.getElementsByClassName ("restName");
var divContainers = document.getElementsByClassName("divContainer");

//create new request and open to post

var req = new XMLHttpRequest();
req.open('POST', location.pathname, true);

//loop through all restaurant names and wait for [x] to be clicked. When it is, delete it and send the info in request object

	for (var i = 0; i < divContainers.length; i++) {
		delDivs[i].addEventListener("click",function (event) {
			req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			var restToBeDeleted = event.target.parentElement.previousElementSibling.firstElementChild.text
			var divToBeDeleted = event.target.parentElement.parentElement
			var parentOfDiv = divToBeDeleted.parentElement;
			parentOfDiv.removeChild (divToBeDeleted);
			restToBeDeleted = encodeURIComponent(restToBeDeleted)
			req.send('name='+restToBeDeleted);
		});
	}

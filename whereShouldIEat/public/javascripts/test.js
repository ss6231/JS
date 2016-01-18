function bar(event) {
	this.textContent = event.x + ',' + event.y;
}

	var p = document.getElementsByTagName('p');
	for (var i = 0; i < p.length; i++) {
		p[i].addEventListener ("click", bar);
	}



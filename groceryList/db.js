var mongoose = require ('mongoose'), 
	URLSlugs = require ('mongoose-url-slugs');

//define item schema
var Item = new mongoose.Schema ({
	name: String,
	quantity: Number,
	checked: Boolean
})

//define list schema
var List = new mongoose.Schema ({
	name: String,
	createdBy: String,
	items: [Item]
});

//define slugs plugin
List.plugin(URLSlugs('name'));

//define models
mongoose.model ('List', List);
mongoose.model ('Item', Item);



//connect to grocery db
mongoose.connect ('mongodb://localhost/grocerydb');
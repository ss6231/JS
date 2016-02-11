var mongoose = require ('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var URLSlugs = require ("mongoose-url-slugs")


var Restaurant = new mongoose.Schema ({
	factual_id: String,
	name: String,
	address: String,
	price: Number,
	cuisine: Array,
	address_extended: String,
	locality: String,
	region: String,
	postcode: String,
	country: String,
	neighborhood: Array,
	tel: String,
	fax: String,
	website: String,
	latitude: Number,
	longitude: Number,
	hours_display: Object, 
	chain_id: String,
	po_box: String,
	category_ids: Array,
	post_town: String,
	email: String,
	admin_region: String,
	category_labels: String,
	hours: Object,
	chain_name: String

});

var UserSchema = new mongoose.Schema({ 
	restaurants: [{'name':String, 'website':String}],
});
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(URLSlugs('username'));

mongoose.model ('Restaurant', Restaurant); 
mongoose.model ('User', UserSchema);


mongoose.connect ('mongodb://localhost/restaurantsdb');
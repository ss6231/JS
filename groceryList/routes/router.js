var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var List = mongoose.model ('List');

router.get ("/", function (req, res, next) {
	res.render ("test");
})

//get list page
router.get('/list', function(req, res, next) {
	List.find (function (err, lists, count) {
		res.render ('list', {lists:lists})
	})
});

//get creation page
router.get ("/list/create", function (req, res, next) {
	res.render ('create');
});

//get slug page
router.get ("/list/:slug", function (req, res, next) {
	List.findOne ({slug:req.params.slug}, function (err, list, count) {
		res.render ('onelist', list);
	})
})

//creating new list
router.post ("/list/create", function (req, res, next) {
	var list = new List ({name: req.body.listName, createdBy: req.body.authorName});
	list.save (function (err, savedList, count) {
		res.redirect (savedList.slug);
	})
});

//creating new item to add to list
router.post ("/item/create", function (req, res, next) {
	//convert qty to number before adding to db
	List.findOneAndUpdate({slug: req.body.slug}, {$push: {items: {name: req.body.name, quantity: Number(req.body.qty), checked: false}}}, function (err, list, count) {
		res.redirect ("/list/" + list.slug);
	});
});

//checking off item in list
router.post ("/item/check", function (req, res, next) {
	List.findOne ({slug: req.body.slug}, function (err,list, count) {
		for (var i = 0; i < list.items.length; i++) {
			//convert object to string
			var id = list.items[i]._id + "" ;
			if ((req.body.item).indexOf (id) != -1) {
				list.items[i].checked = true;
			}
		}
		list.markModified('items');
		list.save (function (err, modifiedList, count) {
			res.redirect ("/list/" + list.slug);
		})
	})
})


module.exports = router;


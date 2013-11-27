/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Obj = mongoose.model('Object'),
    Reference = mongoose.model('Reference'),
    async = require("async"),
    url = require('url');

function createNewReferencesAndObjects (toId, referenceNames, callback) {
	async.map(
		referenceNames,
		function (refName, iterCallback) {
			Obj.findOne({name: refName}, function (err, obj) {
				if (obj) {
					Reference.create({to: toId, from: obj._id}, iterCallback)
				} else {
					Obj.create({name: refName}, function (err, newObj) { 
						Reference.create({to: toId, from: newObj._id}, iterCallback);
					});
				}
			});
		},
		callback
	);
};

exports.create = function(req, res) {
	var refNames = _.pluck(req.body.references, "name");
	delete req.body.references
	Obj.create(req.body, function (err, obj) {
		createNewReferencesAndObjects(
			obj._id,
			refNames,
			function (objs, err) {
				res.json({obj: obj});
			}
		);
	});
};

exports.destroy = function(req, res) {
	Reference.remove({$or: [ { to: req.objectId }, { from: req.objectId } ] }, function (err) {
		Obj.remove({_id: req.objectId}, function (err) {
			res.json({});
		});
	});
};

exports.update = function (req, res) {
	Reference.remove({to: req.objectId}, function (err) {
		createNewReferencesAndObjects(
			req.objectId,
			_.pluck(req.body.references, "name"),
			function (objs, err) {
				delete req.body.references;
				Obj.findByIdAndUpdate(
					req.objectId, 
					{ $set: req.body }, 
					function (err, obj) {
						return res.json({response: obj});
					}
				);
			}
		)
	});
};

exports.show = function (req, res) {
	Obj.findOne({_id: req.objectId })
		.lean()
		.exec(function(err, obj) {
			Reference.find({to: req.objectId})
				.lean()
				.populate('from')
				.exec(function (err, references) {
					if (err) { return res.status(404).json(false); }
					obj.references = _.pluck(references, "from");
					res.json({obj: obj});
				});
		});
};

exports.all = function (req, res) {
	var query = url.parse(req.url, true).query;
	Obj.find({})
		.limit(query.limit)
		.exec(function(err, objs) {
			if (err) { return res.status(404).json(false); }
			return res.json({objs: objs});
		});
};

exports.search = function (req, res) {
	var query = url.parse(req.url, true).query;
	Obj.search(
		{query: query.term, fields: [ 'name' ], page: 1, pageSize: query.limit}, 
		function(err, objs) {
			objs.hits
			if (err) { return res.status(404).json(false); }
			return res.json({objs: objs});
		});
};

/**
 * Find article by id
 */
exports.object = function(req, res, next, id) {
    Obj.findOne({_id: id}, function(err, object) {
        if (err) return next(err);
        if (!object) return next(new Error('Failed to load object ' + id));
        req.objectId = object._id;
        next();
    });
};

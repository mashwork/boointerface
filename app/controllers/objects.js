/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Obj = mongoose.model('Object'),
    Reference = mongoose.model('Reference'),
    async = require("async"),
    url = require('url');

function findOrCreateObjectBy(createQuery, callback) {
	Obj.findOne(createQuery, function (err, obj) {
		if (obj) {
			callback(err, obj);
		} else {
			Obj.create(createQuery, function (err, newObj) { 
				callback(err, newObj);
			});
		}
	});
}

function createReferncesArray (objId, refType, otherRefType, refNameArray, callback) {
	async.map(
		refNameArray,
		function (refName, iterCallback) {
			findOrCreateObjectBy({name: refName}, function  (err, typeObject) {
				var refCreateObject = {};
				refCreateObject[refType] = objId;
				refCreateObject[otherRefType] = typeObject._id;
				Reference.create(refCreateObject, iterCallback);
			})
		},
		callback
	);
}

function createNewReferencesAndObjects (obj, toNames, fromNames, callback) {
	createReferncesArray(obj._id, "to", "from", fromNames, function (err, refs) {
		createReferncesArray(obj._id, "from", "to", toNames, function (err, moreRefs) {
			callback(err, refs.concat(moreRefs));
		});
	});
};

exports.create = function(req, res) {
	var fromNames = _.pluck(req.body.from, "name");
	var toNames = _.pluck(req.body.to, "name");
	delete req.body.from;
	delete req.body.to;
	Obj.create(req.body, function (err, obj) {
		createNewReferencesAndObjects(
			obj,
			toNames,
			fromNames,
			function (err, refs) {
				res.json({obj: obj});
			}
		);
	});
};

function removeAllReferences (objId, callback) {
	Reference.remove({$or: [ { to: objId }, { from: objId } ] }, callback);
}

exports.destroy = function(req, res) {
	removeAllReferences(req.object._id, function (err) {
		Obj.remove({_id: req.object._id}, function (err) {
			res.json({});
		});
	});
};

exports.update = function (req, res) {
	removeAllReferences(req.object._id, function (err) {
		createNewReferencesAndObjects(
			req.object,
			_.pluck(req.body.to, "name"),
			_.pluck(req.body.from, "name"),
			function (err, refs) {
				delete req.body.from;
				delete req.body.to;
				Obj.findByIdAndUpdate(
					req.object._id, 
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
	Obj.findOne({_id: req.object._id })
		.lean()
		.exec(function(err, obj) {
			Reference.find({to: req.object._id})
				.lean()
				.populate('from')
				.exec(function (err, references) {
					console.log("references = %j", references);
					if (err) { return res.status(404).json(false); }
					obj.from = _.pluck(references, "from");
					Reference.find({from: req.object._id})
						.lean()
						.populate('to')
						.exec(function (err, references) {
							console.log("references = %j", references);
							if (err) { return res.status(404).json(false); }
							obj.to = _.pluck(references, "to");

							res.json({obj: obj});
						})
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
        req.object = object;
        next();
    });
};

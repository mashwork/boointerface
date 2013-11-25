/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Obj = mongoose.model('Object'),
    Reference = mongoose.model('Reference'),
    async = require("async");

function createNewReferencesAndObjects (fromId, referenceNames, callback) {
	async.map(
		referenceNames,
		function (refName, iterCallback) {
			Obj.findOne({name: refName}, function (err, obj) {
				if (obj) {
					Reference.create({from:fromId, to: obj._id}, iterCallback)
				} else {
					Obj.create({name: refName}, function (err, newObj) { 
						Reference.create({from:fromId, to: newObj._id}, iterCallback);
					});
				}
			});
		},
		callback
	);
};

exports.create = function(req, res) {
	createNewReferencesAndObjects(
		req.body._id,
		req.body.referenceNames,
		function (objs, err) {
			delete req.body.referenceNames;
			Obj.create(req.body, function (err, obj) {
				res.json({response: obj});
    		});
		}
	);
};

exports.destroy = function(req, res) {
	Reference.remove({from: req.objectId}, function (err) {
		Obj.remove({_id: req.objectId}, function (err) {
			res.json({});
		});
	});
};

exports.update = function (req, res) {
	Reference.delete({from: req.objectId}, function (err) {
		createNewReferencesAndObjects(
			req.body._id,
			req.body.referencesNames,
			function (objs, err) {
				delete req.body.referencesNames;
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
	console.log("show = %j", req.objectId)
  Obj.findOne({_id: req.objectId }, function(err, obj) {
    if (err) { return res.status(404).json(false); }
    res.json({obj: obj});
  });
};

exports.all = function (req, res) {
  Obj.find({}, function(err, objs) {
    if (err) { return res.status(404).json(false); }
    return res.json({objs: objs});
  });
};

/**
 * Find article by id
 */
exports.object = function(req, res, next, id) {
	console.log(" id = %j", id);
    Obj.findOne({_id: id}, function(err, object) {
    	console.log("returned object = %j", object);
        if (err) return next(err);
        if (!object) return next(new Error('Failed to load object ' + id));
        req.objectId = object._id;
        next();
    });
};

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    _ = require('underscore'),
    Obj = mongoose.model('Object'),
    Reference = mongoose.model('Reference'),
    async = require("async"),
    url = require('url');

function createReferncesArray (objId, refType, otherRefType, refObjectArray, callback) {
	console.log("objId = %j", objId);
	console.log("refType = %j", refType);
	console.log("otherRefType = %j", otherRefType);
	console.log("refObjectArray = %j", refObjectArray);
	async.map(
		refObjectArray,
		function (refObject, iterCallback) {
			delete refObject._id;
			Obj.findOneAndUpdate({name: refObject.name}, refObject, {upsert: true}, function  (err, typeObject) {
				console.log("err = %j", err);
				console.log("typeObject = %j", typeObject);
				var refCreateObject = {};
				refCreateObject[refType] = objId;
				refCreateObject[otherRefType] = typeObject._id;
				Reference.create(refCreateObject, iterCallback);
			})
		},
		callback
	);
}

function createNewReferencesAndObjects (obj, toObjects, fromObjects, callback) {
	console.log("obj = %j", obj);
	console.log("toObjects = %j", toObjects);
	console.log("fromObjects = %j", fromObjects);
	createReferncesArray(obj._id, "to", "from", fromObjects, function (err, refs) {
		createReferncesArray(obj._id, "from", "to", toObjects, function (err, moreRefs) {
			callback(err, refs.concat(moreRefs));
		});
	});
};

exports.create = function(req, res) {
	console.log("req.body = %j", req.body);
	var fromReferences = req.body.from || [];
	var toReferences = req.body.to || [];
	delete req.body.from;
	delete req.body.to;
	Obj.create(req.body, function (err, obj) {
		console.log("err = %j", err);
		if (err) { return res.status(404).json(false); }
		createNewReferencesAndObjects(
			obj,
			toReferences,
			fromReferences,
			function (err, refs) {
				Obj.sync(function (err) {
					res.json({obj: obj});
				});
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
			Obj.sync(function (err) {
				res.json({});
			});
		});
	});
};

exports.update = function (req, res) {
	removeAllReferences(req.object._id, function (err) {
		createNewReferencesAndObjects(
			req.object,
			req.body.to || [],
			req.body.from || [],
			function (err, refs) {
				delete req.body.from;
				delete req.body.to;
				Obj.findByIdAndUpdate(
					req.object._id, 
					{ $set: req.body }, 
					function (err, obj) {
						Obj.sync(function (err) {
							return res.json({response: obj});
						});
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
			console.log("obj = %j", obj);
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
                            console.log(obj);
							res.json({obj: obj});
						})
				});
		});
};

exports.getByName = function(req, res){
    Obj.findOne({name: req.params.objectName})
        .exec(function(err, obj) {
            if (err) { return res.status(404).json(false); }
            if (!obj){ return res.json(false) }
            Reference.find({from: obj._id})
                .lean()
                .populate('to')
                .exec(function (err, references){
                    if (err) { return res.status(404).json(false); }
                    var r = references;
                    if(r !== undefined){
                        r = _.map(r, function(tmp){ return tmp.to.boolean })
                    }
                    obj = obj.toObject(); //Transform moongose object to object to attach properties
                    obj.has_references_booleans = r; //Attach the boolean of the references
                    return res.json({obj: obj, references: r});
                })
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

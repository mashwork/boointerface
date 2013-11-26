/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Reference = mongoose.model('Reference');
    
exports.destroy = function(req, res) {
	Reference.remove({_id: req.referenceId}, function (err) {
		res.json({});
	});
};

/**
 * Find article by id
 */
exports.reference = function(req, res, next, id) {
	console.log(" id = %j", id);
    Reference.findOne({_id: id}, function(err, ref) {
    	console.log("returned ref = %j", ref);
        if (err) return next(err);
        if (!ref) return next(new Error('Failed to load ref ' + id));
        req.referenceId = ref._id;
        next();
    });
};

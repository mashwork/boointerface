/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;


/**
 * Reference Schema
 */
var ReferenceSchema = new Schema({
    from: {type : Schema.ObjectId, ref : 'Object'},
    to: {type : Schema.ObjectId, ref : 'Object'}
});


mongoose.model('Reference', ReferenceSchema);
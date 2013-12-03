/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    elmongo = require('elmongo'),
    Schema = mongoose.Schema;


/**
 * Object Schema
 */
var ObjectSchema = new Schema({
    name: { type: String, unique: true, trim: true, autocomplete: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    boolean: { type: String, default: ''},
    twitter_boolean: { type: String, default: ''}
});

ObjectSchema.plugin(elmongo);

var Objects = mongoose.model('Object', ObjectSchema);

Objects.sync(function (err) {
	console.log("index ready");
});
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;


/**
 * Object Schema
 */
var ObjectSchema = new Schema({
    name: { type: String, unique: true, trim: true, index : "text" },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    boolean: { type: String, default: ''}
});


mongoose.model('Object', ObjectSchema);
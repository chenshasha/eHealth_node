/**
 * Created by shashachen on 2/18/14.
 */
var mongoose = require('mongoose');

// define
var patientSchema = mongoose.Schema({
    user_id      : String,
    lastName     : String,
    firstName    : String,
    phone        : String,
    address      : String
});

module.exports = mongoose.model('Patient', patientSchema);
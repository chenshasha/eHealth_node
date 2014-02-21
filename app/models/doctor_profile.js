/**
 * Created by shashachen on 2/20/14.
 */
var mongoose = require('mongoose');

// define
var doctorSchema = mongoose.Schema({
    user_id      : String,
    lastName     : String,
    firstName    : String,
    phone        : String,
    email        : String,
    address      : String,
    department   : String,
    review       :[]
});

module.exports = mongoose.model('Doctor', doctorSchema);
/**
 * Created by shashachen on 2/20/14.
 */
var mongoose = require('mongoose');

// define
var agentSchema = mongoose.Schema({
    user_id      : String,
    lastName     : String,
    firstName    : String,
    phone        : String,
    address      : String
});

module.exports = mongoose.model('Agent', agentSchema);
/**
 * Created by Katie on 4/1/14.
 */
var mongoose = require('mongoose');

// define
var logSchema = mongoose.Schema({
    user_id      : String,
    content      : String,
    module_name	 : String,
    postDate     : Date

});

module.exports = mongoose.model('Log', logSchema);
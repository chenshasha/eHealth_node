/**
 * Created by shashachen on 2/21/14.
 */
var mongoose = require('mongoose');

// define
var replySchema = mongoose.Schema({
    user_id      : String,
    content      : String,
    mainThreadID : String,
    postDate     : Date

});

module.exports = mongoose.model('Reply', replySchema);
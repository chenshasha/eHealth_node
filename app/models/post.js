/**
 * Created by shashachen on 2/21/14.
 */
var mongoose = require('mongoose');

// define
var postSchema = mongoose.Schema({
    user_id      : String,
    postType     : String,
    postTitle    : String,
    postDate     : Date,
    content      : String,
    reply        : []

});

module.exports = mongoose.model('Post', postSchema);
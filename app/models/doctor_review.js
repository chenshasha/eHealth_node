/**
 * Created by macbookpro on 3/14/14.
 */
var mongoose = require('mongoose');

// define
var doctorReviewSchema = mongoose.Schema({
        _id                :String,
        value              :{
            texts          :[],
            full_address   :String,
            hours          :{},
            categories     :[],
            city           :String,
            review_count   :Number,
            name           :String,
            Stars          :Number,
            attributes     :{}

        }
    },
    {collection:'doctor_review'}
);

module.exports = mongoose.model('DoctorReview', doctorReviewSchema);
/**
 * Created by shashachen on 2/20/14.
 */

/**
 * request status:
 * 0: patient initialize
 * 1: agent process
 * 2: patient accept and wait for doctor
 * 3: doctor accept and wait for patient
 * 4: both accept
 * 5: both decline
 */
var mongoose = require('mongoose');

// define
var pendingReqSchema = mongoose.Schema({
    broker_id       : String,
    doctor_id       : String,
    modifiedDate    : Date,
    insurance       : String,
    reason          : String,
    department      : String,
    address         : String,

    status          : Number,
    patient_id      : String,
    appDate         : Date,
    city            : String,
    specialty       : String,
    zipcode         : String,
    infor           : String,
    review_name     : [],
    review_star     : [],
    review_address  : [],
    review_bussiness_id : [],


});

module.exports = mongoose.model('PendingReq', pendingReqSchema);
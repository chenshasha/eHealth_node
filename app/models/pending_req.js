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
    status          : String,  // PENDING, CONFIRMED, CANCELED 
    patient_id      : String,
    patient_name	: String,
    broker_id       : String,
    broker_name     : String,
    doctor_id       : String,
    doctor_yelp_id	: String,
    doctor_name	    : String,
    modifiedDate    : Date,
    insurance       : String,
    reason          : String,
    department      : String,
    appDate         : Date,
    address         : String
});

module.exports = mongoose.model('PendingReq', pendingReqSchema);
var Patient       = require('../app/models/patient_profile');
var PendingReq    = require('../app/models/pending_req');
var Agent         = require('../app/models/agent_profile');
var Doctor        = require('../app/models/doctor_profile');
var Post          = require('../app/models/post');
var Reply         = require('../app/models/reply');
var Yelp 		  = require('../app/yelp/yelpApi');
var mongoose      = require('mongoose');
var Log			  = require('../app/models/log');
var User		  = require('../app/models/user');
var nodemailer 	  = require('nodemailer');
var randomstring  = require('randomstring');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "eHealth.node@gmail.com",
        pass: "CMPE295B"
    }
});

module.exports = function(app, passport) {


// normal routes ===============================================================

    // view home page
    app.get('/home', function(req, res) {
        res.render('home.ejs', {

        });
    });


    //reply to post
    app.post('/replypost/:id', isLoggedIn, function(req, res) {
        var reply = new Reply();
        reply.user_id      = req.user.id;
        reply.mainThreadID = req.params.id;
        reply.postDate     = new Date();
        reply.content      = req.param('content');
        reply.save();
        console.log(reply);
        Post.findOne({_id: req.params.id}, function (err, post) {
            if (err) {
            }
            ;
            post.reply.push(reply);
            post.save();
        });

        //Save the activity into logs
        var log = new Log();
        log.user_id = req.user.id;
        log.content = "A new reply has been submitted.";
        log.module_name = "Forum";
        log.postDate = new Date();
        log.save();
        console.log("A new log has been saved into database.");

        res.redirect('/viewpost/'+ req.params.id);

    });

    //submit new post
    app.post('/newpost', isLoggedIn, function(req, res) {
        var post = new Post();
        post.user_id    = req.user.id;
        post.postTitle  = req.param('title');
        post.postType   = req.param('postType');
        post.postDate   = new Date();
        post.content    = req.param('content');
        post.save();

        //Save the activity into logs
        var log = new Log();
        log.user_id = req.user.id;
        log.content = "A new post has been submitted.";
        log.module_name = "Forum";
        log.postDate = new Date();
        log.save();
        console.log("A new log has been saved into database.");

        res.redirect('/forum');

    });

    //edit new post
    app.get('/newpost', isLoggedIn, function(req, res) {
        res.render('newpost.ejs', {

        });
    });

    //view post
    app.get('/viewpost/:id', function(req, res) {

        Post.findOne({_id: req.params.id}, function (err, post) {
            if (err) {
            }
            ;
            res.render('viewpost.ejs', {
                post: post
            });
        });


    });

    // construct forum
    app.get('/forum', function(req, res) {

        Post.find({},function (err, posts) {
            if (err) {
            }
            ;
            res.render('forum.ejs', {
                posts: posts
            });
        });

    });


    // patient submit request
    app.post('/app_request', isLoggedIn, function(req, res) {
    	if(req.param('command') == "search"){
    		var city = req.param('city');
    		if(!city){
    			city="San Jose"; // Add default
    		}
    		var keywords = req.param('keywords');
    		var specialty = req.param('specialty');
    		Yelp.search(keywords, specialty, city, 5, function(error, data) {
    			  if(!data) { 
    				  console.log(error);
    			  } else {
    		          res.render('patient_app_request.ejs', {physicians: (data.businesses)?data.businesses:[],
    		            	element_1_1: req.param('element_1_1'),
    		            	element_1_2: req.param('element_1_2'),
    		            	element_1_3: req.param('element_1_3'),
    		            	city: city,
    		            	keywords: keywords,
    		            	specialty: specialty,
    		            	reason:req.param('reason'),
    		            	physician: req.param('physician'),
    		        	  });
    			  }
    			});
    		
    	} else {
			var request = new PendingReq();
			request.status = 'PENDING';
			request.patient_id = req.user.id;
			request.doctor_yelp_id =  req.param('physician');
			if(request.doctor_yelp_id) {
				Yelp.get(request.doctor_yelp_id, function(error, data) {
	    			  if(!data) { 
	    				  console.log(error);
	    			  } else {
	    				  // Add the patient's name to the appointment
	    				  Patient.findOne({user_id:req.user.id}, function(err, patient) {
	    		                // if there are any errors, return the error
	    		                if (err || !patient)
	    		                    return done(err+"\n Cannot locate the user");
	  	    				  request.doctor_name = data.name;
	  	    				  request.patient_name = patient.firstName+" "+patient.lastName;
							  request.address = data.location.display_address.join();
							  request.modifiedDate = new Date();
							  request.insurance = req.param('insurance');
							  request.reason = req.param('reason');
							  request.department = req.param('specialty');
							  var month=parseInt(req.param('element_1_1'));
							  month--;
							  request.appDate = new Date(req.param('element_1_3'),
									  month, req.param('element_1_2'));
							  request.save();
							  console.log("Created appointent " + request);

                              //Save the activity into logs
                              var log = new Log();
                              log.user_id = req.user.id;
                              log.content = "A new appointment has been submitted.";
                              log.module_name = "Appointment";
                              log.postDate = new Date();
                              log.save();
                              console.log("A new log has been saved into database.");

				              res.render('patient_app_view.ejs', {
				                    items: [request],
				                    user: req.user,
				                    message: "The following appointment request has been submitted."
				              });


	    		            });
	    			  }
	    			});
			} else {
				console.log("Must choose a physician!");
				res.redirect('/app');
			}
		}
    }
    	);


    // patient request appointment, doctor respond to request
    app.get('/app', isLoggedIn, function(req, res) {
    	var today= new Date();
        if(req.user.local.userType == "patient"){
            res.render('patient_app_request.ejs', {physicians:[],
            	element_1_1: today.getMonth()+1,
            	element_1_2: today.getDate(),
            	element_1_3: today.getFullYear(),
            	city: "",
            	keywords: "",
            	specialty:"",
            	reason:"",
            	physician:""} );
        }else if(req.user.local.userType == "agent"){
//        	res.render('agent_app_view.ejs', {
//                items: [],
//                user: req.user
//            });
            res.redirect('/viewapp');

        } else if(req.user.local.userType == "doctor"){
            PendingReq.find({"doctor_id": req.user.id}, function (err, item) {
//                res.render('doc_app_request.ejs', {
//                    item: item,
//                    user: req.user
//                });
                  res.redirect('/viewapp');
            });
        }

    });

    // patient/agent/doctor view appointment
    app.get('/viewapp', isLoggedIn, function(req, res) {
        if(req.user.local.userType == "patient"){
            PendingReq.find({"patient_id": req.user.id}, function (err, items) {
                res.render('patient_app_view.ejs', {
                    items: items,
                    user: req.user
                });
            });
        }else if(req.user.local.userType == "agent"){
            PendingReq.find({'modifiedDate':{$exists:true}}, function (err, items) {
               	if (err) {
             		console.log("Error finding appointments for the current agent");
             	}
                res.render('agent_app_view.ejs', {
                    items: items,
                    user: req.user
                });
            });


        }else if(req.user.local.userType == "doctor"){
        	 Doctor.findOne({user_id:req.user.id}, function(err, doc) {
             	if (!doc) {
             		console.log("Error locataing the current doctor");
             	}

             	PendingReq.find({"doctor_yelp_id": doc.yelp_id}, function (err, items) {
             		res.render('doc_app_view.ejs', {
             			items: items,
             			user: req.user
             		});
             	});

        	 });

        };
    });
    

	// modify appointment
	app.post('/modifyApp', isLoggedIn, function(req, res) {
		// TODO proper access control is needed here.
		var appId=req.param('appId');
		var action=req.param('command');
        PendingReq.findOne({"_id": appId}, function (err, app) {
			if (app) {
				if (action == "DELETE") {
					PendingReq.findByIdAndRemove(appId, function(error){
						console.log("Deleted appointment "+app);

				        //Save the activity into logs
                        var log = new Log();
                        log.user_id = req.user.id;
                        log.content = "An appointment ("+appId+") has been deleted.";
                        log.module_name = "Appointment";
                        log.postDate = new Date();
                        log.save();
                        console.log("A new log has been saved into database.");

					});
				} else {
					if (action == "CANCEL") {
						app.status = "CANCELED";
					} else if (action == "CONFIRM") {
						app.status = "CONFIRMED";
					}
					var today = new Date();
					app.modifiedDate = today;
					
					if(req.user.local.userType == "agent"){
						// resolve agent name
						Agent.findOne({user_id:req.user.id}, function(err, agent) {
							if (err || !agent)
								return done(err+"\n Cannot locate the agent");
  	    				  	app.broker_name=agent.firstName+" "+agent.lastName;
							app.save();
							console.log("Updated appointent " + app);

					        //Save the activity into logs
                            var log = new Log();
                            log.user_id = req.user.id;
                            log.content = "An appointment ("+appId+") has been updated by "+app.broker_name+".";
                            log.module_name = "Appointment";
                            log.postDate = new Date();
                            log.save();
                            console.log("A new log has been saved into database.");

		                });
					} else {
						app.save();
						console.log("Updated appointent " + app);

			            //Save the activity into logs
                        var log = new Log();
                        log.user_id = req.user.id;
                        log.content = "An appointment ("+appId+") has been updated.";
                        log.module_name = "Appointment";
                        log.postDate = new Date();
                        log.save();
                        console.log("A new log has been saved into database.");
					}
				}
			} else {
				console.log("Unable to locate the app with appId=" + appId);
			}
        	res.redirect('/viewapp');
        });
	});


	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// PROFILE SECTION =========================
	app.get('/modifyprofile', isLoggedIn, function(req, res) {
        if(req.user.local.userType == "doctor"){
            Doctor.findOne({user_id:req.user.id}, function(err, doc) {
            	if (!doc) {
                    doc = new Doctor();
                    doc.user_id = req.user.id;
            	}
                res.render('modify_doc_profile.ejs', {
                    user : req.user,
                    person  : doc
                });
            });
        }else{
            res.render('modify_profile.ejs', {
                user : req.user
            });
        }
	});

    //create new profile when sign up or modify profile
    app.post('/profile', isLoggedIn, function(req, res) {
    	console.log("Current user type "+ req.user.local.userType + " user ID "+ req.user.id );
        if(req.user.local.userType == "patient"){
            Patient.findOne({user_id:req.user.id}, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user){
                    //console.log("ininin");
                    var patient = new Patient();
                    patient.user_id = req.user.id;
                    patient.firstName = req.param('firstName');
                    patient.lastName = req.param('lastName');
                    patient.address = req.param('address');
                    patient.phone = req.param('phone');
                    patient.email = req.param('email');
                    patient.save();

                    //Save the activity into logs
                    var log = new Log();
                    log.user_id = req.user.id;
                    log.content = "A new patient ("+ req.param('firstName') +") has been registered.";
                    log.module_name = "Profile";
                    log.postDate = new Date();
                    log.save();
                    console.log("A new log has been saved into database.");
                }
                else{
                    Patient.update({user_id:req.user.id},{firstName: req.param('firstName'), lastName:req.param('lastName'),
                    address:req.param('address'), phone:req.param('phone')}).exec();

                    //Save the activity into logs
                    var log = new Log();
                    log.user_id = req.user.id;
                    log.content = "A patient's profile ("+ req.param('firstName') +") has been updated.";
                    log.module_name = "Profile";
                    log.postDate = new Date();
                    log.save();
                    console.log("A new log has been saved into database.");

                };
                res.redirect('/profile');
            });

        };
        if(req.user.local.userType == "agent"){
            Agent.findOne({user_id:req.user.id}, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user){
                    var agent = new Agent();
                    agent.user_id = req.user.id;
                    agent.firstName = req.param('firstName');
                    agent.lastName = req.param('lastName');
                    agent.address = req.param('address');
                    agent.phone = req.param('phone');
                    agent.email = req.param('email');
                    agent.save();

                    //Save the activity into logs
                    var log = new Log();
                    log.user_id = req.user.id;
                    log.content = "A new agent ("+ req.param('firstName') +") has been registered.";
                    log.module_name = "Profile";
                    log.postDate = new Date();
                    log.save();
                    console.log("A new log has been saved into database.");
                }
                else{
                    Agent.update({user_id:req.user.id},{firstName: req.param('firstName'), lastName:req.param('lastName'),
                        address:req.param('address'), phone:req.param('phone')}).exec();

                    //Save the activity into logs
                    var log = new Log();
                    log.user_id = req.user.id;
                    log.content = "An agent ("+ req.param('firstName') +") updated.";
                    log.module_name = "Profile";
                    log.postDate = new Date();
                    log.save();
                    console.log("A new log has been saved into database.");

                };
                res.redirect('/profile');
            });

        };
        if(req.user.local.userType == "doctor"){
            Doctor.findOne({user_id:req.user.id}, function(err, doctor) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!doctor){
                    doctor = new Doctor();
                }
                    doctor.user_id = req.user.id;
                    doctor.firstName = req.param('firstName');
                    doctor.lastName = req.param('lastName');
                    doctor.address = req.param('address');
                    doctor.phone = req.param('phone');
                    doctor.email = req.param('email');
                    doctor.department = req.param('department');
                    doctor.yelp_id = req.param('yelpId');
                    doctor.save();

                    //Save the activity into logs
                    var log = new Log();
                    log.user_id = req.user.id;
                    log.content = "A new doctor ("+ req.param('firstName') +") has been registered.";
                    log.module_name = "Profile";
                    log.postDate = new Date();
                    log.save();
                    console.log("A new log has been saved into database.");

                    res.render('view_doc_profile.ejs', {
                        user : req.user,
                        person: doctor
                        
                    });
                
            });
        };
     });

    app.get('/profile', isLoggedIn, function(req, res) {
    	
    	console.log("Current user type "+ req.user.local.userType + " user ID "+ req.user.id );
        if(req.user.local.userType == "doctor"){
            Doctor.findOne({user_id:req.user.id}, function(err, doc) {
            	if (!doc) {
                    doc = new Doctor();
                    doc.user_id = req.user.id;
            	}
                res.render('view_doc_profile.ejs', {
                    user : req.user,
                    person  : doc
                });
            });

        }else if(req.user.local.userType == "patient"){
            Patient.findOne({user_id:req.user.id}, function(err, pat) {
            	if (!pat) {
                    pat = new Patient();
                    pat.user_id = req.user.id;
            	}
                res.render('view_general_profile.ejs', {
                    user    : req.user,
                    person  : pat
                });
            });

        }else{
            Agent.findOne({user_id:req.user.id}, function(err, agent) {
                res.render('view_general_profile.ejs', {
                    user    : req.user,
                    person  : agent
                });
            });
        }

    });


    // Forgot password
    app.get('/forgotpassword', function(req, res) {
    	res.render('forgot_password.ejs', { message: req.flash('forgotpwdMsg') });
    });

    app.post('/forgotpassword', function(req, res) {

        User.findOne({'local.email' : req.param('email')}, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            if (!user){
                // if no user is found, return the message
                console.log(req.param('email')+" Not found!");
                req.flash('forgotpwdMsg', 'That email is not existing.');
                res.redirect('/forgotpassword');

            } else {
                console.log(req.param('email')+" Found!");

                //Send an email with temporary password
                var tmp_pwd = randomstring.generate(8); // Generate a 8-char string randomly
                smtpTransport.sendMail({
                    from: "eHealth Admin <eHealth.node@gmail.com>", // sender address
                    to: req.param('email'), // comma separated list of receivers
                    subject: "eHealth System Reset password", // Subject line
                    text: "Hi Dear User, \n\nAs per your request, we have reset your password.\nThe temporary password is " + tmp_pwd + "\nPlease use it to log into our system and change your password.\nThank you for your support.\n\nSincerely,\neHealth Admin"// plaintext body

                }, function(error, response){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("Email sent: " + response.message);

                        //save temporary password into database
                        user.local.password = user.generateHash(tmp_pwd);
                        user.save();

                        //Save the activity into logs
                        var log = new Log();
                        log.user_id = user.id;
                        log.content = "The user has reset the password.";
                        log.module_name = "Reset Password";
                        log.postDate = new Date();
                        log.save();
                        console.log("A new log has been saved into database.");
                        res.redirect('/login');
                    }
                });
            }
        });
    });

    // Change password
    app.get('/changepassword', function(req, res) {
        res.render('change_password.ejs', { message: req.flash('changepwdMsg') });
    });

    app.post('/changepassword', isLoggedIn, function(req, res) {
        if (req.param('password') != req.param('password2')){

            console.log("Two passwords are not same!");
            req.flash('changepwdMsg', 'Two passwords are not same.');
            res.redirect('/changepassword');

        } else {

            console.log("Two passwords are same!");

            //save new password into database
            req.user.local.password = req.user.generateHash(req.param('password'));
            req.user.save();

            //Save the activity into logs
            var log = new Log();
            log.user_id = req.user.id;
            log.content = "The user has changed the password.";
            log.module_name = "Change Password";
            log.postDate = new Date();
            log.save();
            console.log("A new log has been saved into database.");

            res.redirect('/profile');
        }
    });


	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');

	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('signupMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/modifyprofile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));





// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}

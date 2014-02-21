var Patient       = require('../app/models/patient_profile');
var PendingReq    = require('../app/models/pending_req');
var Agent         = require('../app/models/agent_profile');
var Doctor        = require('../app/models/doctor_profile');
var Post          = require('../app/models/post');

module.exports = function(app, passport) {


// normal routes ===============================================================

    //submit new post
    app.post('/newpost', isLoggedIn, function(req, res) {
        var post = new Post();
        post.user_id    = req.user.id;
        post.postTitle      = req.param('title');
        post.postType   = req.param('postType');
        post.postDate   = new Date();
        post.content    = req.param('content');
        post.save();
        res.redirect('/forum');

    });

    //edit new post
    app.get('/newpost', function(req, res) {
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
        var request = new PendingReq();
        request.status          = 0;
        request.patient_id      = req.user.id;
        request.modifiedDate    = new Date();
        request.insurance       = req.param('insurance');
        request.reason          = req.param('reason');
        request.address         = req.param('address');
        request.department      = req.param('department');
        request.appDate         = new Date(req.param('element_1_3'),req.param('element_1_1'),req.param('element_1_2'));
        console.log(request.appDate);
        request.save();
        res.redirect('/app');
    });


    // patient request appointment, doctor respond to request
    app.get('/app', function(req, res) {
        if(req.user.local.userType == "patient"){
            res.render('patient_app_request.ejs');
        }else if(req.user.local.userType == "doctor"){
            PendingReq.find({"doctor_id": req.user.id}, function (err, item) {
                res.render('doc_app_request.ejs', {
                    item: item,
                    user: req.user
                });
            });
        }

    });

    // patient view appointment
    app.get('/viewapp', function(req, res) {

        if(req.user.local.userType == "patient"){
            PendingReq.find({"patient_id": req.user.id}, function (err, item) {
                res.render('patient_app_view.ejs', {
                    item: item,
                    user: req.user
                });
            });
        }else if(req.user.local.userType == "doctor"){
            PendingReq.find({"doctor_id": req.user.id}, function (err, item) {
                res.render('doc_app_view.ejs', {
                    item: item,
                    user: req.user
                });
            });
        };

    });


	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// PROFILE SECTION =========================
	app.get('/modifyprofile', isLoggedIn, function(req, res) {
        if(req.user.local.userType == "doctor"){
            res.render('modify_doc_profile.ejs', {
                user : req.user
            });

        }else{
            res.render('modify_profile.ejs', {
                user : req.user
            });
        }
	});

    //create new profile when sign up or modify profile
    app.post('/profile', isLoggedIn, function(req, res) {
        if(req.user.local.userType == "patient"){
            Patient.findOne(req.user.id, function(err, user) {
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
                }
                else{
                    Patient.update({user_id:req.user.id},{firstName: req.param('firstName'), lastName:req.param('lastName'),
                    address:req.param('address'), phone:req.param('phone'), email : req.param('email')}).exec();

                };
            });
            res.render('view_patient_profile.ejs', {
                user : req.user
            });
        };
        if(req.user.local.userType == "agent"){
            Agent.findOne(req.user.id, function(err, user) {
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
                }
                else{
                    Agent.update({user_id:req.user.id},{firstName: req.param('firstName'), lastName:req.param('lastName'),
                        address:req.param('address'), phone:req.param('phone'), email : req.param('email')}).exec();

                };
            });
            res.render('view_general_profile.ejs', {
                user : req.user
            });
        };
        if(req.user.local.userType == "doctor"){
            Doctor.findOne(req.user.id, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user){
                    var doctor = new Doctor();
                    doctor.user_id = req.user.id;
                    doctor.firstName = req.param('firstName');
                    doctor.lastName = req.param('lastName');
                    doctor.address = req.param('address');
                    doctor.phone = req.param('phone');
                    doctor.email = req.param('email');
                    doctor.department = req.param('department');
                    doctor.save();
                }
                else{
                    Doctor.update({user_id:req.user.id},{firstName: req.param('firstName'), lastName:req.param('lastName'),
                        address:req.param('address'), phone:req.param('phone'), department : req.param('department'), email: req.param('email')}).exec();

                };
            });
            res.render('view_general_profile.ejs', {
                user : req.user
            });
        };
    });

    app.get('/profile', isLoggedIn, function(req, res) {

        if(req.user.local.userType == "doctor"){

            Doctor.findOne(req.user.id, function(err, doc) {
                res.render('view_doc_profile.ejs', {
                    user : req.user,
                    person  : doc
                });
            });

        }else if(req.user.local.userType == "patient"){
            Patient.findOne(req.user.id, function(err, pat) {
                res.render('view_general_profile.ejs', {
                    user    : req.user,
                    person  : pat
                });
            });

        }else{
            Agent.findOne(req.user.id, function(err, agent) {
                res.render('view_general_profile.ejs', {
                    user    : req.user,
                    person  : agent
                });
            });
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

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
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

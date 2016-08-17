var bodyParser = require('body-parser'); 	// get body-parser
var User       = require('../models/user');
var jwt        = require('jsonwebtoken');
var config     = require('../config');
var nodemailer = require('nodemailer');
var uuid = require('node-uuid');



// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

    var apiRouter = express.Router();

    // route to generate sample user
    apiRouter.post('/register', function(req, res) {

        //check user and don't allow duplicate username, email or phone
        User.findOne({$or: [{ 'username': (req.body.username).toLowerCase()}, {'email': req.body.email}, {'phone': req.body.phone}]}, function(err, user) {

            // if there is no chris user, create one
            if (!user) {
                var newUser = new User();

                newUser.name = req.body.name;
                newUser.username = (req.body.username).toLowerCase();
                newUser.password = req.body.password;
                newUser.email = (req.body.email).toLowerCase();
                newUser.phone = req.body.phone;
                newUser.isCompany = req.body.isCompany;
                newUser.area = req.body.area;
                newUser.category = req.body.category;
                newUser.save(function(err){
                    if (err) {
                        res.status(403).send({
                            success: false,
                            message: 'Failed to save user!' //+ err
                        });
                    } else {
                        res.json({
                            message: 'User created.'
                        });
                    }
                });

            } else {
                res.json({
                    message: 'User exist.'
                });
            }

        });

    });

    apiRouter.get('/forgot', function(req, res) {
        res.json({ message: 'Implement here the html forgot pass'});
    });

    apiRouter.post('/reset/:token', function(req, res) {
        console.log('hit route');
        User.findOne({ 'resetPasswordToken': req.params.token, 'resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
            if (!user) {
                res.json({ message: 'Password reset token is invalid or has expired.'});
                //return res.redirect('/forgot');
            } else {
                user.password = req.body.password;
                user.save(function(err){
                    if (err) {
                        res.status(403).send({
                            success: false,
                            message: 'Failed to reset password!' //+ err
                        });
                    } else {
                        res.json({
                            message: 'Password successfully updated.'
                        });
                    }
                });
            }

        });
    });

    apiRouter.post('/forgot', function(req, res) {

        User.findOne({'email': req.body.email}, function(err, user) {
            if (err) res.send(err);
            if (user) {

                //generate password expiration token
                var token = uuid.v4();
                //save the token and expiration in the db
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    if (err) res.send(err);
                });

                var smtpConfig = config.smtpConfig;

                // create reusable transporter object using the default SMTP transport
                var transporter = nodemailer.createTransport(smtpConfig);

                // setup e-mail data with unicode symbols
                var mailOptions = {
                    from: '"Mesteri.com" <info@mesteri.com>', // sender address
                    to: user.email, // list of receivers
                    subject: 'Mesteri.com resetare parola.', // Subject line
                    html: 'Salut ' + user.name + "<br><br> primesti acest email ca urmare a cererii primite de resetare a parolei.<br> Userul tau in portalul Mesteri.com e : <b>" + user.username + "</b><br> apasa <a href='"+config.baseUrl+"/reset/"+ token +"'>aici</a> pentru a reseta parola."// html body
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    res.json({ message: 'Mail sent!'+ info.response });
                });
            } else {
                res.json({ message: 'No user found!'});
            }

        });
    });



    // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    apiRouter.post('/authenticate', function(req, res) {

        // find the user
        User.findOne({
            username: req.body.username
        }).select('name username password isActivated').exec(function(err, user) {

            if (err) throw err;

            // no user with that username was found
            if (!user) {
                res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {
                if(user.isActivated){
                    // check if password matches
                    var validPassword = user.comparePassword(req.body.password);
                    if (!validPassword) {
                        res.json({
                            success: false,
                            message: 'Authentication failed. Wrong password.'
                        });
                    } else {

                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign({
                            userId: user._id,
                            name: user.name,
                            username: user.username
                        }, superSecret, {
                            expiresIn: 900
                        });

                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    }

                } else {
                    res.json ({
                        message: 'User is not activated!'
                    })
                }
            }


        });
    });

    apiRouter.get('/dashboard', isLoggedIn,  function(req, res){
        res.json({ message: 'im in !!!??' });
    });


    function isLoggedIn(req, res, next) {

        // do any checks you want to in here

        // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
        // you can do this however you want with whatever variables you set up
       /* if (req.user.authenticated)
            return next();

        // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
        res.redirect('/');*/


        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['authorization'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, superSecret, function(err, decoded) {
                console.log(err);
                if (err) {
                    res.status(403).send({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;

                    next(); // make sure we go to the next routes and don't stop here
                }
            });

        } else {

            // if there is no token
            // return an HTTP response of 403 (access forbidden) and an error message
            res.status(403).send({
                success: false,
                message: 'No token provided.'
            });

        }
    }

    // on routes that end in /users
    // ----------------------------------------------------
    /*apiRouter.route('/users')

create a user (accessed at POST http://localhost:8080/users)
        .post(function(req, res) {

            var user = new User();		// create a new instance of the User model
            user.name = req.body.name;  // set the users name (comes from the request)
            user.username = req.body.username;  // set the users username (comes from the request)
            user.password = req.body.password;  // set the users password (comes from the request)

            user.save(function(err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'A user with that username, email or phone already exists. '});
                    else
                        return res.send(err);
                }

                // return a message
                res.json({ message: 'User created!' });
            });

        })

        // get all the users (accessed at GET http://localhost:8080/api/users)
        .get(function(req, res) {

            User.find({}, function(err, users) {
                if (err) res.send(err);

                // return the users
                res.json(users);
            });
        });
*/
    // on routes that end in /users/:user_id
    // ----------------------------------------------------
   /* apiRouter.route('/users/:user_id')

    // get the user with that id
        .get(function(req, res) {
            User.findById(req.params.user_id, function(err, user) {
                if (err) res.send(err);

                // return that user
                res.json(user);
            });
        })

        // update the user with this id
        .put(function(req, res) {
            User.findById(req.params.user_id, function(err, user) {

                if (err) res.send(err);

                // set the new user information if it exists in the request
                if (req.body.name) user.name = req.body.name;
                if (req.body.username) user.username = req.body.username;
                if (req.body.password) user.password = req.body.password;
                if (req.body.phone) user.phone = req.body.phone;
                if (req.body.email) user.email = req.body.email;

                // save the user
                user.save(function(err) {
                    if (err) res.send(err);

                    // return a message
                    res.json({ message: 'User updated!' });
                });

            });
        });*/

    // api endpoint to get user information
    apiRouter.get('/me', function(req, res) {
        res.send(req.decoded);
    });


    return apiRouter;
};
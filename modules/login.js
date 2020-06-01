var crypto = require('crypto');
var mDBconfig = require('./db/db_config.js');
var mFn = require('./functions.js');

var fail = { success: false };
var success = { success: true };

function checkHash(hash, token, func) 
{
	var md5sum = crypto.createHash('md5');
	md5sum.update(hash);
	var d = md5sum.digest('hex');
	//mFn.console_out(d);
	if (d == token) func(true);
	else func(false);
};
/**
Login user

@param email - user email
@param hash - hashed (email+privateKey) needed for authorization
@return json with all user data

email=d@l&hash=94835149597b068813cfa661d14e94d4
*/
exports.userLogin = function () 
{
	return function (req, res)
	{
		var email = req.body.email;
		var hashPass = req.body.hash;
		var privateKey = "examplePrivateKey";

		if (email && hashPass)
		{
			checkHash(email+privateKey, hashPass, function (result) 
			{
				if(result)
				{
					checkUser(email, function (result)
					{
						if (result == true)
						{
							mFn.console_out('/login: User login: ' + email);
							mFn.generateSessionId(email);
							getUserData(email, function (data) 
							{
								res.send(data);
							});
						}
						else if (result == "null") //1st login
						{
							newUser(email);
							mFn.generateSessionId(email);
							getUserData(email, function (data)
							{
								res.send(data);
							});
						}
					});
				}
				else
				{
					res.send(fail);
					mFn.console_out('ERROR: /login: hashPass WRONG! Problem with login user: ' + email);
				}
			});
		}
		else
		{
			mFn.console_out("ERROR: /login: Login require arguments");
			res.sen(fail);
		}
	}
};
//check that user exist in database
function checkUser (email, callback) 
{
	var collection = mDBconfig.DB["USERS"];
	collection.find({"email": email}, function(err, result) 
	{
		if (err || !result) callcback(false);
		else if (!mFn.validateJSON(result[0])) callback("null");
		else callback(true);
	});
};

//Generating new user
newUser = function (email) 
{
	if (mFn.validateEmail(email)) 
	{
		var collection = mDBconfig.DB["USERS"];
		collection.ensureIndex({"email": 1}, {unique: true});
		collection.insert({"email": email}, function (err)
		 {
			if(!err)
			{
				mFn.console_out('/login: New user created: ' + email);
			}
			else
			{
				mFn.console_out('ERROR: /login: Problem with create user: ' + email);
			}
		});
	}
	else 
	{
		mFn.console_out('ERROR: /login: Invalid email address' + email);
		res.send('Invalid email address'); 
	}
};

//if login done, function return all information about user including sessionID
function getUserData (email, callback) 
{	
	var collection = mDBconfig.DB["USERS"];
	collection.findOne({ "email": email }, {fields: {"_id": false}}, 
		function (err, docs)
		{
			if (!err)
			{
				callback(JSON.stringify(docs));				
			}
			else
			{
				console_out('ERROR: /login:  Problem with finding the requested data. Cannot return UserData ' + email);
				callback(fail);
			}
		});
};
/**
Update user data

@param email - user email
@param sessionid - sessionID value returned during login
@param user - object with user data
*/
exports.updateUserData = function ()
{
	return function (req, res)
	{
		var UserData = JSON.parse(req.body.user);
		//console.log(UserData);

		var sessionId = req.body.sessionid,
			email = req.body.email,
			collection = mDBconfig.DB["USERS"];

		if (email && sessionId)
		{
			mFn.checkSession(email, sessionId, function (result) 
			{
				if(result == true)
				{
					collection.update({"email": email},{$set: UserData}, function (err)
					{
						if(!err)
						{
							mFn.console_out('/updateuserdata: User data updated: ' + email);
							res.send(success);
						}
						else
						{
							mFn.console_out('ERROR: /updateuserdata: There was problem with update user data: ' + email);
							res.send(fail);
						}
					})	
				}
				else
				{
					mFn.console_out('ERROR: /updateuserdata: email  or sessionid is wrong');
					res.send(fail);
				}
			});
		}
		else
		{
			mFn.console_out('ERROR: /updateuserdata: Arguments require! ');
			res.send(fail);
		}
	}
};
/**
Link FB account with user account

@param email - user email
@param fb - fb login
@param sessionid = sessionID value returned during login
*/
exports.addFb = function () 
{
	return function (req, res) 
	{
		var email = req.body.email,
			fb = req.body.fb,
			sessionId = req.body.sessionid,
			collection = mDBconfig.DB["USERS"];

		mFn.checkSession(email, sessionId, function (result)
		{
			if (result == true)
			{
				linkfb();
			}
			else
			{
				mFn.console_out('ERROR: /addFb: sessionid ' + sessionId + ' or email is wrong: ' + email);
				res.send(fail);
			}
		})

		function linkfb() 
		{
			collection.update({"email": email}, {$set: {"fb_login": fb} }, function (err, doc) 
			{
				if(err)
				{
					mFn.console_out('ERROR: /addFb: Cannot link account with fb');
					res.send(fail);
				}
				else
				{
					mFn.console_out('/addFb: Linking user account with fb succesful.');
					res.send(success);
				}
			});
		};
	}
};

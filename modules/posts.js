var	mDBConfig = require('./db/db_config.js'),
	mFn = require('./functions.js');
/**
prepare message to send by FB

@param email - user email
@param sessionid = sessionID value returned during login
@return prepare message
*/
exports.postMessage = function () 
{
	return function (req, res)
	{
		var	email = req.body.email,
			sessionId = req.body.sessionid,
			post = {},
			title = "";

		var fail = { success: false };
		var success = { success: true };

		if(email && sessionId)
		{
			mFn.checkSession(email, sessionId, function (result) 
			{
				if (result == true)
				{
					returnPost();
				}
				else
				{
					mFn.console_out('ERROR: /post: sessionid ' + sessionId + ' or email is wrong: ' + email);
					res.send(fail);
				}
			});
		}
		else
		{
			mFn.console_out('ERROR: /post: Args require');
			res.send(fail);
		}

		function returnPost () 
		{
			var title = "New high score: ";
			var collection = mDBConfig.DB["POSTS"];

			collection.findOne({"title": title}, {fields : {"title": true, "caption":true, "content":true, "link":true, "image":true, "_id":false }}, function (err, docs) 
		    {
		    	if (!err)
		    	{
		    		post = docs;
		    		res.send(post);
		    		mFn.console_out("/post: {}Object with postMessage send. ");
		    	}
		    	else
		    	{
		    		mFn.console_out("ERROR: /post: Cannot create POSTMessage. ");
		    		res.send(fail);
		    	}
		    });	
		}
	}
};
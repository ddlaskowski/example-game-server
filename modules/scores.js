var mDBConfig = require('./db/db_config.js'),
	mPost = require('./posts.js'),
	mFn = require('./functions.js');

var fail = { success: false };
var success = { success: true };

/**
Update User Hiscore data

@param email - user email
@param points - new value of highscore
@param sessionid = sessionID value returned during login
*/
exports.updateHiScore = function ()
{
	return function (req, res)
	{
		var email = req.body.email,
			points = Number(req.body.points),
			collection = mDBConfig.DB["USERS"];
			old_score = 0,
			collection.findOne({ "email" : email}, {fields : {"high_score": true, "_id": false }}, compareScore);

		function compareScore(err, doc)
		{
			if (!err)
			{
				old_score = doc.high_score;
				//mFn.console_out(old_score);	

				if(old_score[0] < hiscore[0])
				{
					collection.update({ "email" : email}, { $set: {"high_score": points} }, addScore);
				}
				else
				{
					res.send("SORRY. Saved HiScore is better than this.\n")
				}
			}
			else
			{
				mFn.console_out("ERROR: /newhighscore: Cannot get old highscore to compare.")
				res.send(fail);
			}
		};

		function addScore(err, docs) 
		{
			if (err)
			{
				res.send("There was a problem updating information to DB \n");
			}
			else
			{  		
				res.send('Score added\n');
		   	}
		};
	}
};

exports.leaderboard = function () 
{
	return function (req, res) 
	{
		var email = req.body.email,
			sessionId = req.body.sessionid;

		if (email && sessionId)
		{
			mFn.checkSession(email, sessionId, function (result) 
			{
				if (result == true)
				{
					var sortBy = "high_score",
						sortWay = {};
						sortWay[sortBy] = -1;

					var showFields = {};
						showFields["_id"] = false;
						showFields["email"] = true;
						showFields[sortBy] = true;

					var collection = mDBConfig.DB["USERS"];
					collection.find({}, { limit: 100, sort: sortWay, fields: showFields }, 
				    function (err, docs) 
				    {
				    	if (!err)
				    	{
				    		mFn.console_out('/top: List of top returned.');
				    		res.send(JSON.stringify(docs));
				    	}
				    	else
				    	{
				    		mFn.console_out('ERROR: /top: List of top highscores cannot been show. Problem with finding the requested data. ');
				    		res.send(fail);
				    	}
				    });

				}
				else
				{
					mFn.console_out('ERROR: /top: email '+ email + ' or sessionid '+ sessionId +' is wrong.');
					res.send(fail);
				}
			});
		}
		else
		{
			mFn.console_out('ERROR: /top: Arguments require! ');
			res.send(fail);
		}
	}
};
var mDBconfig = require('./db/db_config.js'),
	fs = require('fs');

var DEBUG_MODE = true;


exports.validateJSON = function(data)
{
	for(var i in data) { return true; } return false;
};

exports.validateEmail = function (email) 
{
    // First check if any value was actually set
    if (email.length == 0) return false;
    // Now validate the email format using Regex
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return re.test(email);
};

exports.console_out = function(text) 
{
	if (DEBUG_MODE)
	{ 
		var error = text.indexOf("ERROR: ");
		if (error === -1)
		{
			var log = fs.createWriteStream('./logs/logfile.log', {flags: 'a'});
			log.end(getDateTime() +  " ------ " + text + "\n");	
			console.log("");
			console.log("\033[33m" + getDateTime()+": \033[39m" + text);
			console.log("");
		}
		else
		{
			var errlog = fs.createWriteStream('./logs/error_logfile.log', {flags: 'a'});
			errlog.end(getDateTime() + " ------ " + text + "\n");
			console.log("");
			console.log("\033[33m" + getDateTime()+": \033[31m" + text + "\033[39m");
			console.log("");
		}
	} 
};


exports.generateSessionId = function (email)
{
 var primeString    =  new String('abcdefghijklmnoprstuwxyzABCDEFGHIJKLMNOPRSTUWXYZ0123456789'),
     stringLength    =  primeString.length,
     randomizedString   = String(),
     randomizedStringLenght  = 30;

     for(var i = 0; i<randomizedStringLenght; i++) 
     {
      var rand = Math.floor(Math.random()*stringLength);      
      randomizedString    += primeString[rand];
     };    
mDBconfig.DB['USERS'].update( {'email': email }, { $set: {'session_id': randomizedString} });
};

exports.checkSession = function (email, sessionId, callback) 
{
	var collection = mDBconfig.DB["USERS"];
	collection.findOne({"email":email},{fields : {"session_id": true, "_id": false }}, compare);

	function compare (err, doc) 
	{
		if (!err)
		{
			if (sessionId == doc.session_id)
			{
				callback(true);
			}
			else
			{
				callback(false);
			}
		}
		else
		{
			callback(false);
		}
	}
};

function getDateTime() 
{
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;
};


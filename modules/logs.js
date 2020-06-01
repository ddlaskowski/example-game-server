//File to delete before official release

exports.gimmelog = function () 
{
	return function (req, res) 
	{
		res.sendfile('./logs/logfile.log');
	}
}

exports.gimmeerrlog = function () 
{
	return function (req, res) 
	{
		res.sendfile('./logs/error_logfile.log');
	}
}
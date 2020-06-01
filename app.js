
/**
 * Module dependencies.
 */
var express = require('express'),
	https = require('https'),
	fs = require('fs'),
	path = require('path');

var app = express();

//MyModules
var mScores = require('./modules/scores.js'),
	mLogin = require('./modules/login.js'),
	mPosts = require('./modules/posts.js'),
  mLogs = require('./modules/logs.js'),
	certPath = "cert";

var httpsOptions = 
{
    key: fs.readFileSync(path.join(certPath, "server.key")),
    cert: fs.readFileSync(path.join(certPath, "server.crt")),
    ca: fs.readFileSync(path.join(certPath, "server.csr")),
    requestCert: true,
  	rejectUnauthorized: false
};

// all environments
app.set('port', process.env.PORT || 3003);
//app.set('json spaces', 0);
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
//app.use(express.methodOverride());
//app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) 
{
  app.use(express.errorHandler());
}

app.get('/', function(req, res)
{
  res.send("ExampleGame API is running");
});
app.get('/top', mScores.leaderboard());
app.get('/log', mLogs.gimmelog());
app.get('/errlog', mLogs.gimmeerrlog());


app.post('/addfb', mLogin.addFb()); //link FB account with user account with _id
app.post('/login', mLogin.userLogin()); //po zalogowaniu zwraca wszystkie dane dotyczące usera o podanym emailu
app.post('/preparepost', mPosts.postMessage());
app.post('/updateuserdata', mLogin.updateUserData());
app.post('/newhighscore', mScores.updateHiScore());


//LISTEN
https.createServer(httpsOptions, app).listen(app.get('port'), function() 
{
    console.log('Express HTTPS server listening on port ' + app.get('port'));
});
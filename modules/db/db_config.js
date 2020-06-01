var dbConfig = exports,
	mongo = require('mongodb'),
	monk = require('monk'),
	dbDriver = monk('http://127.0.0.1:27017/example_game');

dbConfig.DB = [];

dbConfig.DB["USERS"] = dbDriver.get('example_users');
dbConfig.DB["POSTS"] = dbDriver.get('example_posts');
dbConfig.DB["SHOPS"] = dbDriver.get('example_shops');


dbConfig.DB["GAMEMAP"] = dbDriver.get('example_game_map');
dbConfig.DB["POWERUPS"] = dbDriver.get('example_powerups');
dbConfig.DB["SCORES"] = dbDriver.get('example_scores');
dbConfig.DB["TIMERS"] = dbDriver.get('example_timers');
dbConfig.DB["TIPS"] = dbDriver.get('example_tips');
dbConfig.DB["STARS"] = dbDriver.get('example_star_system');
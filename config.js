var config = {};
config.mySqlConnString = {};

config.testMode = false;
config.logDirectory = './logs';
config.logFile = 'logs.log'
config.mongoUrl = 'mongodb://xxxxxx:27017/xx';
config.mySqlConnString = {
    host: 'xxxxxxxx',
    user: 'x',
    password: 'y',
    database: 'someDBName'
};

module.exports = config;

var MongoClient = require('mongodb').MongoClient;
var mysql = require('mysql2');
var fs = require('fs');
var utils = require('./utils');
var config = require('./config');

var logFilePath = `${config.logDirectory}/${config.logFile}`;
if (!fs.existsSync(config.logDirectory)) {
    fs.mkdirSync(config.logDirectory);
}

utils.logInfo(logFilePath, "Data Migration Tool v1.0");

var connection = mysql.createConnection(config.mySqlConnString);

connection.connect(function(err) {
    if (err) {
        utils.logInfo(logFilePath, 'Error connecting to MySql DB');
        return;
    }

    utils.logInfo(logFilePath, 'Connection established to MySql DB');

    MongoClient.connect(config.mongoUrl, function(err, db) {

        if (err) {
            utils.logInfo(logFilePath, 'Error connecting to MongoDB');
            return;
        }

        utils.logInfo(logFilePath, "Connection established to MongoDB");

        importToMySql(db, function() {
            utils.logInfo(logFilePath, 'closing DBs connections..');
            connection.end(function(err) {});
            db.close();
        });
    });
});

var importToMySql = function(db, closeConnectionsCallback) {

    var failedCounter = 0;
    var successMatchedCounter = 0;
    var successUnmatchedCounter = 0;
    var totalCounter = 0;
    var totalCounterCountDown = 0;

    utils.logInfo(logFilePath, '\nMigration process is starting..');

    var cursor = db.collection('someCollection').find({
        "isDeleted": true
    });

    utils.logInfo(logFilePath, 'Migrating data..');

    var operations = [];

    cursor.each(function(err, doc) {
        if (doc != null) {
            var id = Math.trunc(doc._id);

            if (config.testMode === false) {
                operations.push(new Promise((resolve, reject) => {
                    connection.query(`CALL SomeStoredProcedure(${id})`, function(error, rows) {
                        if (error) {
                            utils.logInfo(logFilePath, `Error occured when calling SomeStoredProcedure SP for id=${id}. see error: ${JSON.stringify(error)}`);
                            failedCounter++;
                            reject(error);
                        } else {
                            if (rows.affectedRows === 1) { // Has match with the MySQL records
                                successMatchedCounter++;
                            } else {
                                successUnmatchedCounter++;
                            }
                            resolve();
                        }
                    });
                }));
            }
            totalCounter++;
        } else {
            Promise.all(operations)
                .then(() => {
                    utils.logInfo(logFilePath,
                        `Summary - Total Found: ${totalCounter}, Success and Matched: ${successMatchedCounter}, Success but Unmatched: ${successUnmatchedCounter}, Failed: ${failedCounter}`);

                    closeConnectionsCallback();
                });
        }
    });
};